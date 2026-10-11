import json
import sys
from pathlib import Path

RUNTIME_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(RUNTIME_DIR))

import brasic


def main():
  try:
    request = json.load(sys.stdin)
    filename = request.get("filename", "<editor>")
    source = request["source"]

    error = brasic.analizar_sintaxis(filename, source)

    if error is None:
      result = {"error": None}
    else:
      result = {
        "error": {
          "name": error.error_name,
          "message": error.details or error.error_name,
          "start": {
            "line": error.pos_start.ln,
            "character": error.pos_start.col,
          },
          "end": {
            "line": error.pos_end.ln,
            "character": error.pos_end.col,
          },
        }
      }

    print(json.dumps(result, ensure_ascii=False))

  except Exception as error:
    print(f"Error en el analizador: {error}", file=sys.stderr)
    raise SystemExit(1)


if __name__ == "__main__":
  main()
