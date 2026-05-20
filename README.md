# Student Management System

A production-style **DevOps demo** project: Node.js microservices, Docker, Kubernetes, and GitHub Actions CI/CD.

---

## Project Overview

| Component | Technology | Port |
|-----------|------------|------|
| Backend API | Node.js + Express | 5000 |
| Frontend UI | Node.js + Express + HTML | 3000 |
| Container registry | Docker Hub | — |
| Orchestration | Kubernetes (namespace `sms`) | — |
| CI/CD | GitHub Actions | — |

**APIs (backend)**

- `GET /` → `"Backend is running"`
- `GET /students` → JSON list of students

**Frontend**

- Title: **Student Management System**
- Button: **Load Students**
- Frontend server proxies requests to `http://sms-backend-service:5000/students` (Kubernetes internal DNS)

---

## Architecture

```text
┌─────────────┐     push      ┌──────────────────┐     build/push    ┌─────────────┐
│   GitHub    │ ────────────► │  GitHub Actions  │ ────────────────► │  Docker Hub │
│   (main)    │               │    ci-cd.yaml    │                   │   images    │
└─────────────┘               └──────────────────┘                   └──────┬──────┘
                                                                              │
                                                                              ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                              Kubernetes (namespace: sms)                                  │
│                                                                                          │
│   ┌─────────────────────┐         ClusterIP              ┌─────────────────────┐        │
│   │  sms-frontend (x2)  │ ──────► sms-backend-service ──►│  sms-backend (x1)   │        │
│   │  NodePort :30080    │         :5000                  │  :5000              │        │
│   └─────────────────────┘                                └─────────────────────┘        │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

**Why a proxy on the frontend?**

Browsers cannot resolve `sms-backend-service` (cluster DNS). The frontend Express server calls `http://sms-backend-service:5000/students` inside the pod network; the UI calls `/students` on the same host.

---

## Project Structure

```text
student-management-system/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── server.js
│   ├── package.json
│   ├── Dockerfile
│   └── public/index.html
├── k8s/
│   ├── namespace.yaml
│   ├── backend-deployment.yaml
│   ├── frontend-deployment.yaml
│   └── service.yaml
├── .github/workflows/
│   └── ci-cd.yaml
├── docker-compose.yml
└── README.md
```

---

## Step 1 — Run locally with Docker Compose

```bash
cd student-management-system
docker compose up --build -d
docker compose ps
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:5000 |
| Students API | http://localhost:5000/students |

Stop:

```bash
docker compose down
```

---

## Step 2 — Build and push images to Docker Hub

Replace `YOUR_DOCKERHUB_USERNAME` with your Docker Hub username.

```bash
docker login

docker build -t YOUR_DOCKERHUB_USERNAME/sms-backend:latest ./backend
docker push YOUR_DOCKERHUB_USERNAME/sms-backend:latest

docker build -t YOUR_DOCKERHUB_USERNAME/sms-frontend:latest ./frontend
docker push YOUR_DOCKERHUB_USERNAME/sms-frontend:latest
```

---

## Step 3 — GitHub Actions CI/CD

### Required secrets (Repository → Settings → Secrets)

| Secret | Description |
|--------|-------------|
| `DOCKERHUB_USERNAME` | Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token |

On every **push to `main`**, the workflow:

1. Checks out code
2. Logs in to Docker Hub
3. Builds and pushes `sms-backend`
4. Builds and pushes `sms-frontend`

---

## Step 4 — Deploy to Kubernetes

### 4.1 Update image names

Edit `k8s/backend-deployment.yaml` and `k8s/frontend-deployment.yaml`:

```yaml
image: YOUR_DOCKERHUB_USERNAME/sms-backend:latest
image: YOUR_DOCKERHUB_USERNAME/sms-frontend:latest
```

### 4.2 Apply manifests

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/service.yaml
```

### 4.3 Verify

```bash
kubectl get all -n sms
kubectl get pods -n sms
kubectl get svc -n sms
```

### 4.4 Access frontend

**Minikube:**

```bash
minikube service sms-frontend-service -n sms --url
```

**Or NodePort:**

```bash
kubectl get nodes -o wide
# Open http://<NODE_IP>:30080
```

**Docker Desktop Kubernetes:**

```bash
kubectl port-forward -n sms svc/sms-frontend-service 3000:3000
# Open http://localhost:3000
```

Click **Load Students** to fetch data from the backend via the frontend proxy.

---

## Step 5 — Useful commands

```bash
# Backend logs
kubectl logs -n sms -l app=sms-backend

# Frontend logs
kubectl logs -n sms -l app=sms-frontend

# Delete deployment
kubectl delete -f k8s/service.yaml
kubectl delete -f k8s/frontend-deployment.yaml
kubectl delete -f k8s/backend-deployment.yaml
kubectl delete -f k8s/namespace.yaml
```

---

## Demo checklist

- [ ] `docker compose up` — UI loads at :3000
- [ ] **Load Students** shows 4 students
- [ ] `curl http://localhost:5000/students` returns JSON
- [ ] GitHub Actions pushes images on `main`
- [ ] Kubernetes pods are `Running` in namespace `sms`
- [ ] Frontend reachable on NodePort `30080` or port-forward

---

## License

Educational / DevOps demo project.
