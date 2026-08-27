FROM eclipse-temurin:21-jdk-noble AS build
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

FROM eclipse-temurin:21-jre-noble
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

COPY --from=build --chown=1000:1000 /app/build/libs/*.jar app.jar

ENV JAVA_TOOL_OPTIONS="\
  -XX:+UseG1GC -XX:MaxGCPauseMillis=100 \
  -XX:+UseContainerSupport \
  -XX:MaxRAMPercentage=65.0 \
  -XX:InitialRAMPercentage=30.0 \
  -XX:TieredStopAtLevel=1 \
  -Dspring.jmx.enabled=false \
  -Dio.grpc.netty.shaded.io.netty.handler.ssl.noOpenSsl=true"

ENV PORT=8082
EXPOSE 8082

USER 1000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:${PORT}/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT} -jar app.jar"]