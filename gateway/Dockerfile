FROM golang:1.24-alpine AS builder

WORKDIR /app

RUN apk add --no-cache protobuf
RUN go install google.golang.org/protobuf/cmd/protoc-gen-go@v1.36.9 && \
    go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@v1.5.1

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN protoc -I proto \
    --go_out=. --go_opt=module=gateway \
    --go-grpc_out=. --go-grpc_opt=module=gateway \
    proto/auth.proto proto/tour.proto

RUN CGO_ENABLED=0 go build -o gateway .

FROM alpine:3.21

WORKDIR /app
COPY --from=builder /app/gateway .

EXPOSE 8080
CMD ["./gateway"]
