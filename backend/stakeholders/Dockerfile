FROM golang:1.24-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -o stakeholders-service .

FROM alpine:3.21

WORKDIR /app
COPY --from=builder /app/stakeholders-service .

EXPOSE 8081
CMD ["./stakeholders-service"]
