FROM php:8.2-apache

# Install MySQL PDO extension
RUN docker-php-ext-install pdo pdo_mysql

# Enable Apache modules
RUN a2enmod rewrite headers

# Set working directory
WORKDIR /var/www/html

# Copy backend files
COPY . .

# Configure Apache DocumentRoot and permissions
RUN sed -i 's|/var/www/html|/var/www/html|g' /etc/apache2/sites-available/000-default.conf \
    && echo '<Directory /var/www/html>\n\
    Options Indexes FollowSymLinks\n\
    AllowOverride All\n\
    Require all granted\n\
</Directory>' >> /etc/apache2/apache2.conf

# Set CORS headers in Apache config
RUN echo 'Header set Access-Control-Allow-Origin "*"\n\
Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"\n\
Header set Access-Control-Allow-Headers "Content-Type"' >> /etc/apache2/apache2.conf

# Configure Apache to listen on PORT env variable
RUN sed -i 's/Listen 80/Listen ${PORT:-80}/g' /etc/apache2/ports.conf \
    && sed -i 's/:80/:${PORT:-80}/g' /etc/apache2/sites-available/000-default.conf

# Set default PORT
ENV PORT=80
ENV APACHE_RUN_USER=www-data
ENV APACHE_RUN_GROUP=www-data

# Start Apache
CMD ["apache2-foreground"]
