# Multi-stage build for Flutter Web (optional)
# Note: For mobile app, this Dockerfile is mainly for building web version

# Stage 1: Build
FROM debian:latest AS build-env

# Install Flutter dependencies
RUN apt-get update && apt-get install -y \
  curl \
  git \
  unzip \
  xz-utils \
  zip \
  libglu1-mesa \
  && rm -rf /var/lib/apt/lists/*

# Install Flutter
RUN git clone https://github.com/flutter/flutter.git -b stable /flutter
ENV PATH="/flutter/bin:$PATH"

# Enable web support
RUN flutter channel stable
RUN flutter upgrade
RUN flutter config --enable-web

# Set working directory
WORKDIR /app

# Copy files
COPY pubspec.* ./
RUN flutter pub get

COPY . .

# Build for web
RUN flutter build web --release

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy built app to nginx
COPY --from=build-env /app/build/web /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
