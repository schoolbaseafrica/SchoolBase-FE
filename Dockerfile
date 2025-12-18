FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build arguments for Next.js environment variables
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

# Build the application
RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]