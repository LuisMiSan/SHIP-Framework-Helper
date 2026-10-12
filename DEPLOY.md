# Instalar S.H.I.P. en tu VPS

Guía paso a paso para Ubuntu 22.04/24.04 o Debian 12. Copia y pega cada bloque en la terminal del VPS.

## Cómo queda montado

```
Navegador ──HTTPS──▶ Caddy (tu VPS)
                      ├─ /            → la web (carpeta /var/www/ship-framework)
                      └─ /api/gemini/ → proxy de Gemini (solo escucha dentro del VPS)
                                         ├─ pregunta a Firebase: "¿este usuario está aprobado?"
                                         └─ si sí, llama a Gemini con la clave secreta
```

La clave de Gemini **solo vive en el VPS**. El navegador nunca la ve.
Los datos (proyectos, usuarios) siguen en Firebase, protegidos por `firestore.rules`.

## 0. Antes de empezar

- Un dominio o subdominio (ej. `ship.tu-dominio.com`) con un registro **A** apuntando a la IP del VPS.
- Una **clave de Gemini nueva y solo para el VPS**: en [Google AI Studio](https://aistudio.google.com/apikey) crea una clave. En Google Cloud, pon un límite de gasto o una alerta de presupuesto.
- Las reglas de `firestore.rules` **ya publicadas** en Firebase y tus clientes en `allowedEmails` (ver la PR).

## 1. Instalar programas (una sola vez)

```bash
sudo apt update && sudo apt install -y git curl debian-keyring debian-archive-keyring apt-transport-https ufw

# Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo bash -
sudo apt install -y nodejs

# Caddy (servidor web con HTTPS automático)
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install -y caddy
```

## 2. Cortafuegos

Solo se abren SSH y la web. El proxy de Gemini queda cerrado al exterior.

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80,443/tcp
sudo ufw enable
```

## 3. Descargar y construir la app

```bash
sudo useradd --system --create-home --shell /usr/sbin/nologin ship
sudo mkdir -p /opt/ship-framework /var/www/ship-framework
sudo chown ship:ship /opt/ship-framework

sudo -u ship git clone https://github.com/LuisMiSan/SHIP-Framework-Helper.git /opt/ship-framework
cd /opt/ship-framework
sudo -u ship npm ci
sudo -u ship npm run build
sudo rsync -a --delete dist/ /var/www/ship-framework/
```

> Si el repo es privado, GitHub te pedirá usuario y un *token* (no tu contraseña). Créalo en GitHub → Settings → Developer settings → Personal access tokens, solo con permiso de lectura.

## 4. Guardar la clave de Gemini (en secreto)

```bash
sudo mkdir -p /etc/ship-framework
sudo nano /etc/ship-framework/gemini.env
```

Escribe dentro (con tu clave real) y guarda con `Ctrl+O`, `Enter`, `Ctrl+X`:

```
GEMINI_API_KEY=tu-clave-real
```

Protege el archivo para que solo root y el servicio puedan leerlo:

```bash
sudo chown root:ship /etc/ship-framework/gemini.env
sudo chmod 640 /etc/ship-framework/gemini.env
```

## 5. Arrancar el proxy de Gemini

```bash
sudo cp /opt/ship-framework/deploy/ship-gemini-proxy.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now ship-gemini-proxy
curl http://127.0.0.1:8787/api/gemini/health   # debe responder: ok
```

## 6. Configurar Caddy (la web + HTTPS)

```bash
sudo cp /opt/ship-framework/deploy/Caddyfile /etc/caddy/Caddyfile
sudo nano /etc/caddy/Caddyfile     # cambia ship.tu-dominio.com por tu dominio real
sudo systemctl reload caddy
```

Abre `https://tu-dominio` en el navegador. La primera vez tarda unos segundos mientras Caddy consigue el certificado.

## 7. Permitir el login de Google en tu dominio

Firebase Console → **Authentication** → **Settings** → **Authorized domains** → **Add domain** → escribe tu dominio.
Sin esto, el botón "Continuar con Google" da error.

## 8. Comprobar que todo funciona

1. Entra con una cuenta que **no** esté en `allowedEmails` → debe salir "Cuenta pendiente de aprobación".
2. Entra con una cuenta aprobada → pide ayuda a la IA en un paso → debe responder.
3. Si algo falla, mira los registros:
   ```bash
   sudo journalctl -u ship-gemini-proxy -n 50
   sudo journalctl -u caddy -n 50
   ```

| Mensaje en el registro | Qué significa |
|---|---|
| `GEMINI_API_KEY is not set` | Falta el paso 4 |
| Respuestas `403 Account not approved` | Ese email no está en `allowedEmails` |
| Respuestas `429` | Un usuario hizo más de 20 peticiones en un minuto |

## Actualizar la app cuando haya cambios

```bash
cd /opt/ship-framework
sudo -u ship git pull
sudo -u ship npm ci
sudo -u ship npm run build
sudo rsync -a --delete dist/ /var/www/ship-framework/
sudo systemctl restart ship-gemini-proxy
```

## Qué protege el proxy

- Solo usuarios **aprobados** (lo decide Firebase con las mismas reglas de `firestore.rules`).
- Solo los 4 modelos que usa la app. Cualquier otro se rechaza.
- Máximo 20 peticiones por usuario y minuto, y peticiones de 15 MB como mucho.
- La clave nunca sale del VPS ni aparece en las respuestas.
