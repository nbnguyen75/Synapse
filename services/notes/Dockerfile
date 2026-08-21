FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

COPY gradlew .
COPY gradle ./gradle
COPY build.gradle.kts settings.gradle.kts ./
RUN chmod +x gradlew

RUN --mount=type=cache,target=/root/.gradle/caches \
    ./gradlew dependencies --no-daemon > /dev/null 2>&1 || true

COPY src ./src
RUN --mount=type=cache,target=/root/.gradle/caches \
    ./gradlew build -x test -x spotlessApply -x spotlessCheck --no-daemon

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN apk add --no-cache curl

COPY --from=build --chown=1000:1000 /app/build/libs/*.jar app.jar

# ENV TZ=Asia/Ho_Chi_Minh
ENV JAVA_TOOL_OPTIONS="\
  -XX:+UseG1GC -XX:MaxGCPauseMillis=100 \
  -XX:+UseContainerSupport \
  -XX:MaxRAMPercentage=65.0 -XX:InitialRAMPercentage=30.0 \
  -XX:TieredStopAtLevel=1 \
  -Dspring.jmx.enabled=false"

EXPOSE 8082
USER 1000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8082/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]