kubectl create namespace cloudflare

kubectl create secret generic cloudflare-api-key \
  --from-literal=<cloudflare-api-key> \
  --from-literal=<cloudflare-email> \
  --namespace=cloudflare

helm repo add kubernetes-sigs https://kubernetes-sigs.github.io/external-dns/
helm repo update
helm upgrade --install external-dns kubernetes-sigs/external-dns \
  --namespace cloudflare \
  --set sources[0]=ingress \
  --set policy=sync \
  --set provider.name=cloudflare \
  --set env[0].name=CF_API_TOKEN \
  --set env[0].valueFrom.secretKeyRef.name=cloudflare-api-key \
  --set env[0].valueFrom.secretKeyRef.key=apiKey \
  --wait

kubectl create namespace cert-manager
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --set crds.enabled=true

kubectl create secret generic cloudflare-api-key \
  --from-literal=<cloudflare-api-key> \
  --from-literal=<cloudflare-email> \
  --namespace=cert-manager

cat << EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: cloudflare-letsencrypt
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    privateKeySecretRef:
      name: cloudflare-acme
    solvers:
      - dns01:
          cloudflare:
            apiTokenSecretRef:
              name: cloudflare-api-key
              key: apiKey
EOF
