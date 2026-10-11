
import sys
from pathlib import Path

RUNTIME_DIR = Path(__file__).resolve().parent

sys.path.insert(0, str(RUNTIME_DIR))

import brasic


def main():
    if len(sys.argv) != 2:
        print(
            "Uso: python3 runner.py archivo.bras",
            file=sys.stderr,
        )
        return 2

    archivo = Path(sys.argv[1]).resolve()

    if archivo.suffix.lower() != ".bras":
        print(
            "Error: el archivo debe tener extensión .bras",
            file=sys.stderr,
        )
        return 2

    try:
        codigo = archivo.read_text(encoding="utf-8")
    except OSError as error:
        print(f"Error al leer el archivo: {error}", file=sys.stderr)
        return 1

    _, error = brasic.run(str(archivo), codigo)

    if error:
        print(error.as_string(), file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

