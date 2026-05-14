# Smart Student Management System

Node.js project with a static **frontend** (Express on port **3000**) and a **backend API** (Express on port **5000**). The browser talks to the API at `http://localhost:5000` while you use the site at `http://localhost:3000`.

---

## Run with Docker (recommended for class demos)

These steps work on **Ubuntu Linux** (Docker Engine + Compose plugin) and on **Windows** / **macOS** with Docker Desktop.

### 1. Install Docker

- **Ubuntu**: Install [Docker Engine](https://docs.docker.com/engine/install/ubuntu/) and the [Compose plugin](https://docs.docker.com/compose/install/linux/).
- **Windows / macOS**: Install [Docker Desktop](https://docs.docker.com/desktop/), which includes Compose.

Check your install:

```bash
docker --version
docker compose version
```

### 2. Build and start the stack

Open a terminal in the **project root** (the folder that contains `docker-compose.yml`):

```bash
docker compose up --build
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **API health check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

Leave this terminal open while you use the app. Logs from both containers appear in the same window.

### 3. Stop the containers

In the terminal where Compose is running, press **Ctrl+C**.

To stop and remove the containers (keeps your images):

```bash
docker compose down
```

---

## Docker files (overview)

| File               | Purpose |
|--------------------|---------|
| `Dockerfile`       | Builds one Node service from `frontend/` or `backend/` using `npm ci` and `npm start`. |
| `.dockerignore`    | Keeps `node_modules`, `.git`, and log noise out of the build context. |
| `docker-compose.yml` | Runs **app** (frontend) and **api** (backend) with ports, names, and `restart: unless-stopped`. |
| `k8s/` | Kubernetes **Deployment** + **NodePort Service** for the frontend (port **3000**). |

---

## Run without Docker (local Node)

You need two terminals.

**Terminal 1 — backend**

```bash
cd backend
npm install
npm start
```

**Terminal 2 — frontend**

```bash
cd frontend
npm install
npm start
```

Then open [http://localhost:3000](http://localhost:3000).

---

## Project layout

- `frontend/` — static pages + `server.js` (Express static server)
- `backend/` — REST API + sessions (`server.js`)
- `k8s/` — Kubernetes manifests (frontend web tier on port **3000**)

---

## Run on Kubernetes (Minikube / Docker Desktop / Ubuntu)

This section deploys the **frontend** image (Express on port **3000**), using the **same Docker image** you already build from the root `Dockerfile` with `SERVICE=frontend`. The manifests are beginner-friendly and work with **Minikube**, **Docker Desktop Kubernetes**, and standard clusters on **Ubuntu**.

### What gets deployed

| Manifest | Purpose |
|----------|---------|
| `k8s/deployment.yaml` | `Deployment` named `sms-frontend` — runs replica Pods with image `sms-frontend:latest`, container port **3000**. |
| `k8s/service.yaml` | `NodePort` `Service` named `sms-frontend-service` — maps **3000** → Pods, exposes **nodePort 30080** on the node. |

**Viva tip:** A *Deployment* declares desired state (replicas, image, ports); a *Service* gives stable DNS/IP and load-balances to healthy Pods via *label selectors*.

> **Full stack note:** The browser UI calls the API at `http://localhost:5000` (see `frontend/js/api.js`). This Kubernetes example focuses on the **web tier on port 3000**. For login/API flows in a cluster, you would add a second Deployment/Service for the backend image (`sms-backend:latest`) or use **Docker Compose** locally for both services.

### Prerequisites

- [kubectl](https://kubernetes.io/docs/tasks/tools/) installed and configured for your cluster.
- A running cluster: **Minikube** (common on Ubuntu labs) or **Docker Desktop → Enable Kubernetes**.

### Minikube on Ubuntu (typical lab setup)

1. Install Minikube ([official guide](https://minikube.sigs.k8s.io/docs/start/?arch=%2Flinux%2Fx86-64%2Fstable%2Fbinary+download)).
2. Start a cluster:

   ```bash
   minikube start
   ```

3. Point your shell at Minikube’s Docker daemon so `docker build` tags images **inside** the VM (simplest way to avoid a registry):

   ```bash
   eval $(minikube docker-env)
   ```

4. From the project root (where `Dockerfile` lives), build the **frontend** image with the same tags Kubernetes expects:

   ```bash
   docker build -t sms-frontend:latest \
     --build-arg SERVICE=frontend \
     --build-arg EXPOSE_PORT=3000 \
     .
   ```

   (Optional) Clear the Minikube Docker env when finished building:

   ```bash
   eval $(minikube docker-env -u)
   ```

**Alternative:** Build on your host Docker and load the image:

```bash
docker build -t sms-frontend:latest --build-arg SERVICE=frontend --build-arg EXPOSE_PORT=3000 .
minikube image load sms-frontend:latest
```

### Docker Desktop Kubernetes

1. Enable Kubernetes in Docker Desktop settings and wait until it shows **Running**.
2. Build the image on your machine (Docker Desktop’s engine):

   ```bash
   docker build -t sms-frontend:latest --build-arg SERVICE=frontend --build-arg EXPOSE_PORT=3000 .
   ```

3. Apply the manifests (below). To open the app, use **port-forward** (NodePort behaves differently on Docker Desktop):

   ```bash
   kubectl port-forward service/sms-frontend-service 3000:3000
   ```

   Then browse to [http://localhost:3000](http://localhost:3000).

### Deploy (any cluster)

From the project root:

```bash
kubectl apply -f k8s/
```

Expected output mentions `deployment.apps/sms-frontend` and `service/sms-frontend-service` **created** or **configured**.

### Check status

```bash
kubectl get pods
kubectl get pods -l app=sms-frontend
kubectl get svc
kubectl get deployment sms-frontend
```

### Open the app (Minikube)

Minikube can print a reachable URL (handles NodePort for you):

```bash
minikube service sms-frontend-service --url
```

Or open in a browser window:

```bash
minikube service sms-frontend-service
```

You can also visit `http://<minikube-ip>:30080` (NodePort **30080** → container **3000**).

### View logs

Logs from all Pods matching the app label:

```bash
kubectl logs -l app=sms-frontend --tail=100
```

Follow logs (live):

```bash
kubectl logs -f -l app=sms-frontend
```

Logs for one Pod by name:

```bash
kubectl get pods
kubectl logs <pod-name>
```

### Delete the deployment (and Service)

Remove everything defined in `k8s/`:

```bash
kubectl delete -f k8s/
```

Or delete by resource type:

```bash
kubectl delete deployment sms-frontend
kubectl delete service sms-frontend-service
```

### Troubleshooting (short)

| Symptom | What to check |
|--------|----------------|
| `ImagePullBackOff` | Image not present in the cluster’s Docker (Minikube: use `minikube docker-env` or `minikube image load`). |
| `CrashLoopBackOff` | `kubectl logs <pod-name>` — confirm the container listens on **3000**. |
| Service has no endpoints | `kubectl get pods --show-labels` — labels must match the Service `selector`. |
