FROM php:8.2-cli

# Install MySQL PDO extension
RUN docker-php-ext-install pdo pdo_mysql

# Set working directory
WORKDIR /var/www/html

# Copy backend files
COPY . .

# Set environment variables
ENV PORT=8080
ENV DB_HOST=localhost
ENV DB_NAME=railway
ENV DB_USER=root
ENV DB_PASSWORD=

# Expose port
EXPOSE 8080

# Use PHP built-in server
CMD php -S 0.0.0.0:${PORT} -t /var/www/html
