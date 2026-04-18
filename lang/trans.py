 # Windows 12 网页版是一个开放源项目,希望让用户在网络上预先体验 Windows 12.
 # @author tangyuan0821 <tangyuan0821@email.cn>  tjy-gitnub <starry-source@outlook.com>
 # @license EPL v2
 # @link <https://github.com/win12-online/win12>
from msvcrt import getch, kbhit
from pathlib import Path
import sys
from colorama import init
init(autoreset=True)
black=30
red=31
green=32
yellow=33
blue=34
pink=35
cyan=36
white=37
fullchar='█'
def color(what,text=None,bg=None,bold=False,underline=False,blink=False,fanxian=False,disnone=False):
    clist=[]
    clist.append(str(text)) if text else None
    clist.append(str(bg+10)) if bg else None
    clist.append('1') if bold else None
    clist.append('4') if underline else None
    clist.append('5') if blink else None
    clist.append('7') if fanxian else None
    clist.append('8') if disnone else None
    return '\033['+';'.join(clist)+'m'+what+'\033[0m'

def clear():
    print("\x1b[2J\x1b[H", end='')

clear_c = "\x1b[2J\x1b[H"
clear_line_c = "\r\033[K"

SCRIPT_DIR = Path(__file__).resolve().parent
DEFAULT_HTML = SCRIPT_DIR.parent / "desktop.html"
DEFAULT_PROPS = SCRIPT_DIR / "lang_en.properties"


def clamp(value: int, low: int, high: int) -> int:
    return max(low, min(value, high))


def load_lines(path: Path):
    return path.read_text(encoding='utf8').split('\n')


def save_lines(path: Path, lines):
    path.write_text('\n'.join(lines), encoding='utf8')


def append_property(path: Path, key: str, value: str):
    with path.open('a', encoding='utf8') as fh:
        fh.write(f"{key}={value}\n")


def display_context(lines, index: int):
    clear()
    start = max(0, index - 7)
    end = min(len(lines), index + 8)
    for idx in range(start, end):
        line = lines[idx]
        print(color(line, blue) if idx == index else line)
    print('------------------------------------\n')


def prompt_start_line(total: int) -> int:
    raw = input('Start line (1-based, default 1): ').strip()
    if raw == '':
        return 0
    try:
        line_no = int(raw) - 1
    except ValueError:
        line_no = 0
    return clamp(line_no, 0, max(0, total - 1))


def main():
    html_path = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else DEFAULT_HTML
    props_path = Path(sys.argv[2]).resolve() if len(sys.argv) > 2 else DEFAULT_PROPS
    if not html_path.exists():
        print(f"HTML file not found: {html_path}")
        return
    lines = load_lines(html_path)
    if not lines:
        print('HTML file is empty, nothing to edit.')
        return

    index = prompt_start_line(len(lines))
    pos = len(lines[index])

    while 0 <= index < len(lines):
        display_context(lines, index)
        pos = clamp(pos, 0, len(lines[index]))
        while True:
            print(clear_line_c + f"{index + 1}/{len(lines)}   {lines[index][:pos]}|{lines[index][pos:]}", end='', flush=True)
            g = getch()


            if g in (b'\r', b'\n'):
                index = clamp(index + 1, 0, len(lines) - 1)
                pos = len(lines[index])
                break


            elif g == b'\x1b':
                if kbhit():
                    seq = getch()
                    if seq in (b'[', b'O'):
                        code = getch()
                        if code == b'A':  # Up
                            index = clamp(index - 1, 0, len(lines) - 1)
                            pos = len(lines[index])
                            break
                        elif code == b'B':  # Down
                            index = clamp(index + 1, 0, len(lines) - 1)
                            pos = len(lines[index])
                            break
                        elif code == b'C':  # Right
                            pos = clamp(pos + 1, 0, len(lines[index]))
                        elif code == b'D':  # Left
                            pos = clamp(pos - 1, 0, len(lines[index]))
                else:
                    save_lines(html_path, lines)
                    return


            elif g in (b'\xe0', b'\x00'):
                direction = getch()
                if direction == b'K':  # Left
                    pos = clamp(pos - 1, 0, len(lines[index]))
                elif direction == b'M':  # Right
                    pos = clamp(pos + 1, 0, len(lines[index]))
                elif direction == b'H':  # Up
                    index = clamp(index - 1, 0, len(lines) - 1)
                    pos = len(lines[index])
                    break
                elif direction == b'P':  # Down
                    index = clamp(index + 1, 0, len(lines) - 1)
                    pos = len(lines[index])
                    break

            elif g in (b' ', b'/'):
                print('')
                raw = input('> ').strip()
                if not raw:
                    continue
                if '=' in raw:
                    key, value = raw.split('=', 1)
                    key, value = key.strip(), value.strip()
                else:
                    key, value = raw.strip(), None
                if not key:
                    continue
                insert = f' data-i18n="{key}"'
                lines[index] = lines[index][:pos] + insert + lines[index][pos:]
                save_lines(html_path, lines)
                if value is not None:
                    append_property(props_path, key, value)
                index = clamp(index + 1, 0, len(lines) - 1)
                pos = len(lines[index])
                break

        if index == len(lines) - 1 and g in (b'\r', b'\n'):
            save_lines(html_path, lines)
            return


if __name__ == '__main__':
    main()
