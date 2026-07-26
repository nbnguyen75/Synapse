# Stage 1: build
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# copy gradle wrapper + config trước để cache layer dependencies
COPY gradlew .
COPY gradle ./gradle
COPY build.gradle.kts settings.gradle.kts ./
RUN chmod +x gradlew

# tải dependencies trước, tách riêng để cache — chỉ invalidate khi build.gradle.kts đổi
RUN ./gradlew dependencies --no-daemon || true

# copy source code, build thật
COPY src ./src
RUN ./gradlew build -x test --no-daemon

# Stage 2: runtime (JRE slim)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]