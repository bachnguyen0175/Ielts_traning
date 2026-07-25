#!/usr/bin/env python3
"""Ingest one ieltstrainingonline.com reading test into a playable Test JSON.

Pipeline:  fetch page (follows 301) -> parse prose/stems/answers ->
           merge onto the authoritative seed (answer keys of record) ->
           write apps/web/src/lib/content/ingested/<id>.data.json  (GITIGNORED).

Copyright: this script holds only selectors/logic — no prose. Its OUTPUT carries
Cambridge passage prose + question wording, so it is gitignored and NEVER
committed or distributed (private-study posture; see content/README.md).

Usage:
    python3 content/ingest/ingest.py --volume 15 --test 1 \
        --seed content/seeds/cambridge15-academic-test1.reading.json

Stdlib only (no third-party deps).
"""
import argparse, html as htmlmod, json, re, sys, urllib.request
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
UA = "Mozilla/5.0 (private-study ingester)"


def fetch(volume: int, test: int) -> str:
    url = (f"https://ieltstrainingonline.com/"
           f"cambridge-ielts-{volume}-reading-test-{test}-answers-with-explanations/")
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:  # urllib follows 301 by default
        return r.read().decode("utf-8", "replace")


def _clean_prose(html: str) -> str:
    html = re.sub(r"<(script|style)[^>]*>.*?</\1>", "", html, flags=re.S | re.I)
    html = re.sub(r"</p\s*>", "\n\n", html, flags=re.I)
    html = re.sub(r"<br\s*/?>", "\n", html, flags=re.I)
    html = re.sub(r"<[^>]+>", "", html)
    html = htmlmod.unescape(html)
    html = re.sub(r"\(Q\d+\)", "", html)              # strip explanation anchors
    html = re.sub(r"[ \t]+", " ", html)
    html = re.sub(r"\n\s*\n\s*\n+", "\n\n", html)
    return html.strip()


def parse_html(raw: str) -> list[dict]:
    m = re.search(r'<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>', raw)
    body = re.sub(r"<(script|style)[^>]*>.*?</\1>", "", raw[m.end():], flags=re.S | re.I)
    parts = re.split(r"(READING PASSAGE\s*\d)", body)
    out = []
    for k in range(1, len(parts), 2):
        chunk = parts[k + 1] if k + 1 < len(parts) else ""
        tm = re.search(r"<h2[^>]*>(.*?)</h2>", chunk, re.S | re.I)
        title = re.sub(r"<[^>]+>", "", tm.group(1)).strip() if tm else ""
        qm = (re.search(r"<h4[^>]*>(?:(?!</h4>).)*?Questions\s*\d", chunk, re.S | re.I)
              or re.search(r"Questions\s*\d", chunk))
        prose_html = chunk[tm.end():qm.start()] if tm and qm else ""
        q_region = chunk[qm.start():] if qm else ""
        answers, stems = {}, {}
        for am in re.finditer(r"<strong>\s*(\d{1,2})\s*</strong>", q_region):
            n = int(am.group(1))
            if not (1 <= n <= 40) or n in answers:
                continue
            tail = q_region[am.end():am.end() + 800]
            nxt = re.search(r"<strong>\s*(.*?)\s*</strong>", tail, re.S)
            if not nxt:
                continue
            a = htmlmod.unescape(re.sub(r"<[^>]+>", "", nxt.group(1))).strip(" .…").strip()
            if a:
                answers[n] = a
            # stem = enclosing block (<p>/<li>/<td>), number + answer blanked out
            pre = q_region[:am.start()]
            open_i = max(pre.rfind("<p"), pre.rfind("<li"), pre.rfind("<td"))
            abs_ans = am.end() + nxt.end()
            cm = re.search(r"</(p|li|td)>", q_region[abs_ans:])
            close_i = abs_ans + cm.end() if cm else abs_ans + 200
            block = q_region[open_i:close_i] if open_i >= 0 else tail[:nxt.end()]
            block = block.replace(nxt.group(0), " _______ ")
            block = re.sub(r"<strong>\s*%d\s*</strong>" % n, " ", block)
            stem = htmlmod.unescape(re.sub(r"<[^>]+>", " ", block))
            stem = re.sub(r"\s+", " ", stem).replace("…", "").strip(" .")
            if stem:
                stems[n] = stem
        out.append({"title": title, "prose": _clean_prose(prose_html),
                    "answers": answers, "stems": stems})
    return out


def merge(seed: dict, parsed: list[dict]) -> tuple[dict, list]:
    sec = seed["section"]
    mism = []
    for i, p in enumerate(sec["passages"]):
        pr = parsed[i] if i < len(parsed) else {"prose": "", "answers": {}, "stems": {}}
        p.pop("bodyRef", None)
        p["body"] = pr["prose"]
        for g in p["questionGroups"]:
            kind = g["answerMatch"]["kind"]
            for q in g["questions"]:
                n = q["number"]
                if pr["stems"].get(n):
                    stem = pr["stems"][n]
                    if kind in ("enum", "letter"):     # answer isn't part of the statement
                        stem = re.sub(r"\s*_{3,}\s*$", "", stem).strip()
                    q["content"] = stem
                got, exp = pr["answers"].get(n), q.get("accept")
                if exp and got and got.lower() not in [e.lower() for e in exp]:
                    mism.append((n, got, exp))
    test = {
        "id": seed["test"]["id"], "title": seed["test"]["title"], "type": "academic",
        "source": f"Cambridge IELTS {seed['test'].get('version', '').split('-')[-1]}".strip(),
        "access": "private",
        "sections": [{k: v for k, v in sec.items() if k != "testId"}],
    }
    return test, mism


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--volume", type=int, required=True)
    ap.add_argument("--test", type=int, required=True)
    ap.add_argument("--seed", required=True)
    ap.add_argument("--html", help="use a local HTML file instead of fetching")
    args = ap.parse_args()

    raw = Path(args.html).read_text("utf-8", "replace") if args.html else fetch(args.volume, args.test)
    seed = json.loads(Path(args.seed).read_text())
    parsed = parse_html(raw)
    test, mism = merge(seed, parsed)

    out_dir = REPO / "apps/web/src/lib/content/ingested"
    out = out_dir / f"{test['id']}.reading.data.json"
    out.write_text(json.dumps(test, ensure_ascii=False, indent=2))

    for i, p in enumerate(test["sections"][0]["passages"]):
        nq = sum(len(g["questions"]) for g in p["questionGroups"])
        stems = sum(1 for g in p["questionGroups"] for q in g["questions"] if q.get("content"))
        print(f"P{i+1} \"{p['title']}\": body={len(p['body'].split())}w, stems={stems}/{nq}")
    print("Answer cross-check vs seed:", mism or "all agree")
    print("Wrote", out.relative_to(REPO), "(gitignored)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
