from html.parser import HTMLParser
from pathlib import Path
import re

PAGES = {
    "index.html": ("Home", "/"),
    "projects/letzgo/index.html": ("LetzGo", "/projects/letzgo/"),
    "projects/popin/index.html": ("Popin", "/projects/popin/"),
    "projects/ez-allocate/index.html": ("EZ-Allocate", "/projects/ez-allocate/"),
}
SKIP = {"script", "style", "svg", "form", "button", "nav", "noscript"}
VOID = {"br", "img", "meta", "link", "input", "hr", "source", "area", "col", "embed", "param", "track", "wbr"}
BLOCKS = {"p", "br", "li", "dt", "dd", "blockquote", "summary", "h1", "h2", "h3", "h4"}


class SiteText(HTMLParser):
    def __init__(self, title, href):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.sections = [{"title": title, "href": href, "text": [], "heading": []}]

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        parent = self.stack[-1] if self.stack else ("", False, False, 0)
        inside = parent[1] or tag == "main"
        skip = parent[2] or tag in SKIP or "hidden" in attrs or attrs.get("aria-hidden") == "true"
        skip = skip or "data-guide-open" in attrs or "sr-only" in (attrs.get("class") or "").split()
        skip = skip or attrs.get("id") == "ask-letzgo"
        section = parent[3]
        if inside and not skip and tag in {"section", "article"}:
            inherited = self.sections[section]
            href = inherited["href"]
            if re.fullmatch(r"[a-z][a-z0-9-]*", attrs.get("id") or ""):
                href = href.split("#")[0] + "#" + attrs["id"]
            self.sections.append({"title": "", "href": href, "text": [], "heading": []})
            section = len(self.sections) - 1
        if inside and not skip and tag in BLOCKS:
            self.sections[section]["text"].append("\n")
            if tag == "br":
                self.sections[section]["heading"].append(" ")
        if tag not in VOID:
            self.stack.append((tag, inside, skip, section))

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                _, inside, skip, section = self.stack[i]
                if inside and not skip and tag in BLOCKS:
                    part = self.sections[section]
                    part["text"].append("\n")
                    if tag in {"h1", "h2", "h3", "h4"} and part["heading"] and not part["title"]:
                        part["title"] = " ".join("".join(part["heading"]).split())
                del self.stack[i:]
                return

    def handle_data(self, data):
        if not self.stack:
            return
        _, inside, skip, section = self.stack[-1]
        if not inside or skip:
            return
        part = self.sections[section]
        part["text"].append(data)
        if not part["title"] and any(frame[0] in {"h1", "h2", "h3", "h4"} for frame in self.stack):
            part["heading"].append(data)


print("# Chirag Aggarwal — Portfolio website")
for file, (title, href) in PAGES.items():
    parser = SiteText(title, href)
    parser.feed(Path("dist", file).read_text())
    for part in parser.sections:
        body = "\n".join(" ".join(line.split()) for line in "".join(part["text"]).splitlines())
        body = re.sub(r"\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b", "", body).strip()
        if len(body) < 90:
            continue
        heading = part["title"] or " ".join("".join(part["heading"]).split()) or title
        print(f"\n## {part['href']} | {title} · {heading}\n\n{body}")
