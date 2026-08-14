#!/usr/bin/env python3
"""Seed-FREE ingester: derive a full playable reading Test from one
ieltstrainingonline.com answers page — structure, question types, AND answer
keys — with no hand-authored seed.

This scales past the seed-anchored ingest.py (one seed per test) so a whole
volume of reading tests can be ingested. Same copyright posture: OUTPUT carries
Cambridge prose + question wording, so it is gitignored and NEVER committed or
deployed (local private-study only; see content/README.md, ADR-0006).

Usage:
    python3 content/ingest/ingest_auto.py --volume 15 --test 1
    python3 content/ingest/ingest_auto.py --volume 15 --test 1 --html page.html
    python3 content/ingest/ingest_auto.py --volume 15 --test 1 --html page.html \
        --validate content/seeds/cambridge15-academic-test1.reading.json

Stdlib only.
"""
import argparse, html as htmlmod, json, importlib.util, re, sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]

# Reuse fetch / prose-cleaning / index regeneration from the seed-based tool.
_spec = importlib.util.spec_from_file_location("ingest", Path(__file__).with_name("ingest.py"))
_ing = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_ing)

TFNG = {"TRUE", "FALSE", "NOT GIVEN"}
YNNG = {"YES", "NO", "NOT GIVEN"}
NORMALIZE = ["trim", "collapse-ws", "lowercase"]


def _text(s: str) -> str:
    return re.sub(r"\s+", " ", htmlmod.unescape(re.sub(r"<[^>]+>", " ", s))).strip()


def _bold_runs(segment: str) -> list[str]:
    """All <strong>…</strong> inner texts in order (tags stripped)."""
    return [_text(m) for m in re.findall(r"<strong>(.*?)</strong>", segment, re.S)]


def _numpat(n: int) -> str:
    """<strong> tag holding question number `n` — tolerating a bullet/space
    prefix inside the tag, e.g. `<strong>●   12</strong>`."""
    return r"<strong>\s*(?:[●•·*-]\s*)*%d\s*</strong>" % n


def _present_numbers(region: str) -> dict:
    """Every bold question number 1–40 in a passage's question region → position
    (first occurrence). Lets us catch questions whose group header is missing."""
    out = {}
    for m in re.finditer(r"<strong>\s*(?:[●•·*-]\s*)*(\d{1,2})\s*</strong>", region):
        n = int(m.group(1))
        if 1 <= n <= 40 and n not in out:
            out[n] = m.start()
    return out


def _split_groups(chunk: str) -> list[tuple[int, int, int]]:
    """Return (header_start, block_start, header_end_of_range) for each REAL
    question group (skips the 'Questions X-Y which are based on…' umbrella)."""
    heads = []
    for m in re.finditer(
        r"Questions\s+(\d+)\s*(?:[-–—]\s*(\d+)|and\s+(\d+))", chunk, re.I
    ):
        tail = chunk[m.end(): m.end() + 60]
        if re.match(r"(?:</strong>|</span>|\s)*which\s+are\s+based", tail, re.I):
            continue  # umbrella header ("…which are based on Reading Passage N")
        lo = int(m.group(1))
        hi = int(m.group(2) or m.group(3))
        is_and = m.group(3) is not None
        heads.append((m.start(), m.end(), lo, hi, is_and))
    return heads


def _instruction(block: str) -> str:
    m = re.search(r"</h4>(.*?)(?:<p[^>]*padding-left|<strong>\s*\d)", block, re.S)
    return _text(m.group(1))[:240] if m else ""


def _windows(block: str, n: int):
    """Each occurrence of number `n` → the segment after it (cut at the next
    bold question number). A number can appear more than once — e.g. in a rubric
    ('write 40 on your answer sheet') AND as the real question — so callers try
    each window and keep the first that yields an answer."""
    for m in re.finditer(_numpat(n), block):
        seg = block[m.end(): m.end() + 900]
        cut = re.search(r"<strong>\s*(?:[●•·*-]\s*)*\d+\s*</strong>", seg)
        yield seg[: cut.start()] if cut else seg


def _first_bold(block: str, n: int) -> str | None:
    """First <strong> run right after question number `n`."""
    for seg in _windows(block, n):
        runs = _bold_runs(seg)
        if runs:
            return runs[0]
    return None


def _classify(block: str, nums: list[int], is_and: bool):
    """Return (kind, extra) where kind ∈ text|enum|letter|letter-set."""
    firsts = {n: (_first_bold(block, n) or "").upper() for n in nums}
    firsts = {n: v for n, v in firsts.items() if v}
    vals = set(firsts.values())
    inst = _instruction(block).upper()
    if vals & YNNG and not (vals & {"TRUE", "FALSE"}):
        return "enum", {"options": ["YES", "NO", "NOT GIVEN"]}
    if vals & TFNG:
        return "enum", {"options": ["TRUE", "FALSE", "NOT GIVEN"]}
    if is_and or "TWO LETTER" in inst or re.search(r"\bTWO\b", inst):
        return "letter-set", {}
    if firsts and all(re.fullmatch(r"[A-Z]", v) for v in firsts.values()):
        return "letter", {}
    return "text", {}


def _answer_letter(block: str, n: int) -> str | None:
    for seg in _windows(block, n):
        for r in _bold_runs(seg):
            if re.fullmatch(r"[A-Z]", r.strip()):
                return r.strip()
    return None


def _answer_enum(block: str, n: int) -> str | None:
    # Join the bold runs after the number — "NOT GIVEN" is sometimes split into
    # two bold tags (<strong>NOT</strong> <strong>GIVEN</strong>).
    for seg in _windows(block, n):
        joined = " ".join(_bold_runs(seg)).upper()
        for val in ("NOT GIVEN", "TRUE", "FALSE", "YES", "NO"):
            if re.search(r"\b" + re.escape(val) + r"\b", joined):
                return val
    return None


def _answer_text(block: str, n: int) -> list[str] | None:
    """Completion answer = the bold word(s) right after the number.
    Markup: `<strong>1</strong>…<strong>oval</strong>…` (single word) or
    `<strong>19</strong>…<strong>human</strong> <strong>error</strong>...`
    (multi-word, bold runs separated by a single space). A '/' → alternates."""
    for seg in _windows(block, n):
        words = []
        prev_end = None
        for bm in re.finditer(r"<strong>(.*?)</strong>", seg):
            w = _text(bm.group(1))
            if not w:
                continue
            if re.fullmatch(r"\d+", w):  # ran into the next question number
                break
            if prev_end is not None:
                # subsequent bold joins the answer ONLY if separated by tags/space —
                # an ellipsis or real sentence text between means the answer ended.
                gap = seg[prev_end: bm.start()]
                if "…" in gap or "..." in gap or _text(gap):
                    break
            words.append(w)
            prev_end = bm.end()
        if words:
            phrase = " ".join(words).strip(" .…")
            parts = [p.strip(" .…") for p in phrase.split("/") if p.strip(" .…")]
            return parts or [phrase]
    return None


def _accept_set(block: str) -> list[str]:
    """letter-set: the letters shown as chosen options (padded <p><strong>X</strong>)."""
    out = []
    for m in re.finditer(
        r"padding-left[^>]*>\s*<span[^>]*>\s*<strong>\s*([A-Z])\s*</strong>", block
    ):
        if m.group(1) not in out:
            out.append(m.group(1))
    return out


def _stem(block: str, n: int) -> str:
    best = ""
    for tail in _windows(block, n):
        s = _text(re.sub(r"<strong>.*?</strong>", " _______ ", tail, flags=re.S))
        s = re.sub(r"\s+", " ", s).strip(" .…")
        # prefer the window that actually holds the question (not the rubric)
        if len(s) > len(best):
            best = s
    return best


def _build_group(block: str, nums: list[int], is_and: bool, gid: str) -> dict:
    kind, extra = _classify(block, nums, is_and)
    g = {"id": gid, "range": [nums[0], nums[-1]], "instruction": _instruction(block)}
    if kind == "enum":
        g["type"] = "true_false_not_given" if extra["options"][0] == "TRUE" else "yes_no_not_given"
        g["answerMatch"] = {"kind": "enum", "options": extra["options"]}
        g["questions"] = [
            {"number": n, "accept": [_answer_enum(block, n) or ""], "content": _stem(block, n)}
            for n in nums
        ]
    elif kind == "letter":
        g["type"] = "matching_or_mcq"
        g["answerMatch"] = {"kind": "letter"}
        g["questions"] = [
            {"number": n, "accept": [_answer_letter(block, n) or ""], "content": _stem(block, n)}
            for n in nums
        ]
    elif kind == "letter-set":
        acc = _accept_set(block)
        g["type"] = "multiple_choice_multi"
        g["answerMatch"] = {"kind": "letter-set", "anyOrder": True}
        g["selectCount"] = len(acc) or 2
        g["acceptSet"] = acc
        g["questions"] = [{"number": n, "acceptSetMember": True} for n in nums]
    else:
        g["type"] = "completion"
        g["answerMatch"] = {"kind": "text", "caseSensitive": False, "normalize": NORMALIZE}
        g["questions"] = [
            {"number": n, "accept": _answer_text(block, n) or [""], "content": _stem(block, n)}
            for n in nums
        ]
    return g


def _assemble_groups(chunk: str, heads: list, q_start: int) -> list:
    """Turn header matches + the bold question numbers actually present into an
    ordered list of (block_start, nums, is_and). Robust to real-world mess:
      • overlapping header ranges (source typos) → each number goes to the
        EARLIEST header that covers it, so the later group keeps only what's left;
      • a missing group header → uncovered numbers become an implicit group."""
    present = {n: q_start + pos for n, pos in _present_numbers(chunk[q_start:]).items()}
    # earliest header covering each number
    claim = {}
    for n in present:
        for idx, (hs, he, lo, hi, isand) in enumerate(heads):
            if lo <= n <= hi:
                claim[n] = idx
                break
    segments = []  # (block_start, nums, is_and)
    for idx, (hs, he, lo, hi, isand) in enumerate(heads):
        # keep every declared number EXCEPT ones an earlier header already claimed
        # (that resolves overlaps); letter-set numbers aren't individually bold, so
        # never filter on "present" here — only on earlier-claim.
        nums = [n for n in range(lo, hi + 1) if not (n in claim and claim[n] < idx)]
        if nums:
            segments.append((hs, nums, isand))
    # implicit groups: present numbers no header covers (contiguous runs)
    run = []
    for n in sorted(n for n in present if n not in claim):
        if run and n == run[-1] + 1:
            run.append(n)
        else:
            if run:
                segments.append((present[run[0]], run, False))
            run = [n]
    if run:
        segments.append((present[run[0]], run, False))
    segments.sort(key=lambda s: s[0])
    return segments


def parse_auto(raw: str) -> dict:
    m = re.search(r'<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>', raw)
    body = re.sub(r"<(script|style)[^>]*>.*?</\1>", "", raw[m.end():], flags=re.S | re.I)
    # Some answers are marked with <b> instead of <strong>; normalise so one
    # code path handles both. (Careful not to touch <br>.)
    body = re.sub(r"<b(\s[^>]*)?>", "<strong>", body, flags=re.I)
    body = re.sub(r"</b>", "</strong>", body, flags=re.I)
    # …and some <strong> tags carry style attributes — strip them so the bare-tag
    # regexes below match uniformly.
    body = re.sub(r"<strong[^>]*>", "<strong>", body, flags=re.I)
    parts = re.split(r"(READING PASSAGE\s*\d)", body)
    passages = []
    for k in range(1, len(parts), 2):
        chunk = parts[k + 1] if k + 1 < len(parts) else ""
        tm = re.search(r"<h2[^>]*>(.*?)</h2>", chunk, re.S | re.I)
        title = _text(tm.group(1)) if tm else ""
        heads = _split_groups(chunk)
        prose_end = heads[0][0] if heads else len(chunk)
        prose_start = tm.end() if tm else 0
        prose = _ing._clean_prose(chunk[prose_start:prose_end])
        segments = _assemble_groups(chunk, heads, prose_end)
        groups = []
        for gi, (start, nums, is_and) in enumerate(segments):
            end = segments[gi + 1][0] if gi + 1 < len(segments) else len(chunk)
            block = chunk[start:end]
            groups.append(_build_group(block, nums, is_and, f"p{k // 2 + 1}-g{gi + 1}"))
        passages.append({"id": f"p{k // 2 + 1}", "order": k // 2 + 1,
                         "title": title, "body": prose, "questionGroups": groups})
    return passages


def build_test(passages: list[dict], volume: int, test: int) -> dict:
    return {
        "id": f"cam{volume}-academic-test{test}",
        "title": f"Cambridge IELTS {volume} — Academic Test {test}",
        "type": "academic",
        "source": f"Cambridge IELTS {volume}",
        "sections": [{
            "id": f"cam{volume}-t{test}-reading",
            "skill": "reading",
            "order": 2,
            "durationSeconds": 3600,
            "rules": {"singleTimer": True, "autoAdvanceOnExpiry": True, "extraTransferTime": False},
            "passages": passages,
        }],
    }


def validate(test: dict, seed_path: str) -> int:
    seed = json.loads(Path(seed_path).read_text())
    truth = {}
    for p in seed["section"]["passages"]:
        for g in p["questionGroups"]:
            if g.get("acceptSet"):
                for q in g["questions"]:
                    truth[q["number"]] = ("set", sorted(g["acceptSet"]))
            else:
                for q in g["questions"]:
                    truth[q["number"]] = ("one", [a.lower() for a in q["accept"]])
    got = {}
    for p in test["sections"][0]["passages"]:
        for g in p["questionGroups"]:
            if g.get("acceptSet") is not None:
                for q in g["questions"]:
                    got[q["number"]] = ("set", sorted(g["acceptSet"]))
            else:
                for q in g["questions"]:
                    got[q["number"]] = ("one", [a.lower() for a in q["accept"]])
    ok = 0
    diffs = []
    for n in range(1, 41):
        t, g = truth.get(n), got.get(n)
        if not g:
            diffs.append(f"Q{n}: MISSING (truth={t})")
            continue
        if t[0] == "set":
            if g[0] == "set" and g[1] == t[1]:
                ok += 1
            else:
                diffs.append(f"Q{n}: set got={g} truth={t}")
        else:
            if g[0] == "one" and (set(g[1]) & set(t[1])):
                ok += 1
            else:
                diffs.append(f"Q{n}: got={g[1]} truth={t[1]}")
    print(f"VALIDATION: {ok}/40 answers match the trusted seed")
    for d in diffs:
        print("  ", d)
    # structure check
    groups = [g for p in test["sections"][0]["passages"] for g in p["questionGroups"]]
    seed_groups = [g for p in seed["section"]["passages"] for g in p["questionGroups"]]
    print(f"groups: {len(groups)} (seed {len(seed_groups)}) | passages: "
          f"{len(test['sections'][0]['passages'])}")
    kinds = [g["answerMatch"]["kind"] for g in groups]
    seed_kinds = [g["answerMatch"]["kind"] for g in seed_groups]
    print("kinds     :", kinds)
    print("seed kinds:", seed_kinds)
    print("kinds match:", kinds == seed_kinds)
    return 0 if ok == 40 and kinds == seed_kinds else 1


def coverage(test: dict) -> tuple[str, list[int]]:
    """(fraction string, list of question numbers with no extracted answer).
    Used to refuse to silently ship a test with holes."""
    total = 0
    blanks = []
    for p in test["sections"][0]["passages"]:
        for g in p["questionGroups"]:
            qs = g["questions"]
            total += len(qs)
            if g.get("acceptSet") is not None:
                if not g["acceptSet"]:
                    blanks += [q["number"] for q in qs]
            else:
                blanks += [q["number"] for q in qs if not q["accept"] or not q["accept"][0]]
    return f"{total - len(blanks)}/{total}", sorted(blanks)


def answer_key(raw: str) -> dict:
    """Some pages carry a plain answer-key list at the bottom:
    'Answer … Passage 1  1. creativity  2. rules … Passage 2  14. E …'.
    Parse it to {number: answer}. Returns {} when the page has no such list
    (e.g. cam15-style pages, where answers are inline)."""
    txt = re.sub(r"\s+", " ", htmlmod.unescape(re.sub(r"<[^>]+>", " ", raw)))
    m = re.search(r"Answers?\b[^.]{0,60}?Passage\s*1\b", txt, re.I)
    if not m:
        return {}
    seg = re.split(r"View Answers|Advertisement|adsbygoogle", txt[m.start(): m.start() + 1600])[0]
    key = {}
    for pm in re.finditer(r"(\d{1,2})\.\s+([A-Za-z][A-Za-z /-]*?)(?=\s+\d{1,2}\.|\s+Passage\b|\s*$)", seg):
        n = int(pm.group(1))
        if 1 <= n <= 40 and n not in key:
            key[n] = pm.group(2).strip()
    return key


def _kind_from_values(vals: list[str], inst: str):
    up = [v.upper() for v in vals if v]
    if up and all(v in TFNG for v in up):
        return "enum", ["TRUE", "FALSE", "NOT GIVEN"]
    if up and all(v in YNNG for v in up):
        return "enum", ["YES", "NO", "NOT GIVEN"]
    letters = bool(up) and all(re.fullmatch(r"[A-Z]", v) for v in up)
    if letters and re.search(r"\b(TWO|THREE)\b", inst):
        return "letter-set", None
    if letters:
        return "letter", None
    return "text", None


def apply_answer_key(passages: list, key: dict) -> list:
    """Fill answers + (re)derive each group's answerMatch kind from a plain
    answer-key list, keeping the structure/stems parse_auto already produced."""
    for p in passages:
        for g in p["questionGroups"]:
            nums = [q["number"] for q in g["questions"]]
            stems = {q["number"]: q.get("content", "") for q in g["questions"]}
            vals = [key.get(n, "") for n in nums]
            kind, opts = _kind_from_values(vals, (g.get("instruction") or "").upper())
            if kind == "enum":
                g["type"] = "true_false_not_given" if opts[0] == "TRUE" else "yes_no_not_given"
                g["answerMatch"] = {"kind": "enum", "options": opts}
                g["questions"] = [{"number": n, "accept": [key.get(n, "").upper()], "content": stems[n]} for n in nums]
            elif kind == "letter":
                g["type"] = "matching_or_mcq"
                g["answerMatch"] = {"kind": "letter"}
                g["questions"] = [{"number": n, "accept": [key.get(n, "").upper()], "content": stems[n]} for n in nums]
            elif kind == "letter-set":
                g.pop("acceptSet", None)
                g["type"] = "multiple_choice_multi"
                g["answerMatch"] = {"kind": "letter-set", "anyOrder": True}
                g["selectCount"] = len(nums)
                g["acceptSet"] = sorted({key.get(n, "").upper() for n in nums if key.get(n)})
                g["questions"] = [{"number": n, "acceptSetMember": True} for n in nums]
            else:
                g["type"] = "completion"
                g["answerMatch"] = {"kind": "text", "caseSensitive": False, "normalize": NORMALIZE}
                g["questions"] = [{"number": n, "accept": [key.get(n, "")] if key.get(n) else [""], "content": stems[n]} for n in nums]
    return passages


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--volume", type=int, required=True)
    ap.add_argument("--test", type=int, required=True)
    ap.add_argument("--html", help="local HTML file instead of fetching")
    ap.add_argument("--validate", help="seed JSON to check extraction against")
    ap.add_argument("--write", action="store_true", help="write the gitignored data.json + regen index")
    args = ap.parse_args()

    raw = Path(args.html).read_text("utf-8", "replace") if args.html else _ing.fetch(args.volume, args.test)
    passages = parse_auto(raw)
    key = answer_key(raw)
    if key:
        passages = apply_answer_key(passages, key)
        print(f"(used embedded answer key: {len(key)} answers)")
    test = build_test(passages, args.volume, args.test)

    for i, p in enumerate(test["sections"][0]["passages"]):
        nq = sum(len(g["questions"]) for g in p["questionGroups"])
        print(f'P{i+1} "{p["title"]}": body={len(p["body"].split())}w, groups={len(p["questionGroups"])}, q={nq}')

    cov, blanks = coverage(test)
    print(f"COVERAGE: {cov} answers extracted"
          + (f"  ⚠️ {len(blanks)} blank: {blanks}" if blanks else "  ✓ complete"))

    rc = 0
    if args.validate:
        rc = validate(test, args.validate)
    if args.write:
        out_dir = REPO / "apps/web/src/lib/content/ingested"
        out = out_dir / f"{test['id']}.reading.data.json"
        out.write_text(json.dumps(test, ensure_ascii=False, indent=2))
        _ing.regen_index(out_dir)
        print("Wrote", out.relative_to(REPO), "(gitignored)")
    return rc


if __name__ == "__main__":
    sys.exit(main())
