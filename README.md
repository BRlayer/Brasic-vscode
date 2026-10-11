# Brasic Language Support para Visual Studio Code

Extensión de Visual Studio Code para **Brasic**, un lenguaje de programación educativo diseñado para facilitar el aprendizaje de la programación a personas que hablan español.

## Características

- **Resaltado de sintaxis** para palabras clave, operadores, números, cadenas de texto, comentarios y constantes.
- **Resaltado de funciones integradas**, como `IMPRIMIR`, `ENTRADA`, `LARGO` y `AÑADIR`.
- **Resaltado de funciones definidas por el usuario**, incluidos sus nombres y parámetros.
- **Cierre automático** de paréntesis, corchetes y comillas dobles.
- **Comentarios de línea** mediante `#`.
- **Colores personalizados** para facilitar la lectura del código.

## Ejemplo

```bras
# Un programa sencillo en Brasic

VAR nombre = "Alex"
VAR edad = 14

SI edad >= 18 ENTONCES
    IMPRIMIR("Hola, " + nombre)
SINO
    IMPRIMIR("Bienvenido, " + nombre)
FIN
```

## Sintaxis compatible

La extensión reconoce y resalta los siguientes elementos:

| Categoría | Ejemplos |
|---|---|
| Variables y palabras clave | `VAR`, `SI`, `SINO`, `FIN` |
| Bucles | `MIENTRAS`, `PARA`, `HASTA`, `PASO` |
| Funciones | `FUN`, `DEVOLVER` |
| Operadores lógicos | `Y`, `O`, `NO` |
| Constantes | `VERDADERO`, `FALSO`, `NULL`, `MATH_PI` |
| Funciones integradas | `IMPRIMIR`, `ENTRADA`, `LARGO`, `AÑADIR` |
| Operadores aritméticos y de comparación | `+`, `-`, `*`, `/`, `^`, `==`, `!=`, `<=`, `>=` |
| Cadenas y comentarios | `"Hola"` y `# Comentario` |

## Instalación

### Desde un paquete VSIX

1. Descarga el paquete `.vsix` desde las publicaciones del proyecto, si hay alguno disponible.
2. Abre Visual Studio Code.
3. Accede a la sección **Extensiones**.
4. Abre el menú de los tres puntos (`...`).
5. Selecciona **Instalar desde VSIX...**
