plugins {
  java
  id("org.springframework.boot") version "4.1.1"
  id("io.spring.dependency-management") version "1.1.7"
  id("com.diffplug.spotless") version "6.25.0"
}

group = "com.synapse"
version = "0.2.0"

java {
  toolchain {
    languageVersion = JavaLanguageVersion.of(21)
  }
}

spotless {
  java {
    target("src/**/*.java")
    googleJavaFormat("1.22.0")
    removeUnusedImports()
    trimTrailingWhitespace()
    endWithNewline()
  }
}

repositories {
  mavenCentral()
}

extra["springCloudVersion"] = "2025.1.2"
extra["springCloudGcpVersion"] = "5.8.0"

dependencies {
  implementation("com.fasterxml.jackson.datatype:jackson-datatype-jsr310")
  
  implementation("org.springframework.boot:spring-boot-starter-actuator")
  implementation("org.springframework.boot:spring-boot-starter-data-jpa")
  implementation("org.springframework.boot:spring-boot-starter-security")
  implementation("org.springframework.boot:spring-boot-starter-security-oauth2-resource-server")
  implementation("org.springframework.boot:spring-boot-starter-webmvc")
  implementation("org.springframework.boot:spring-boot-starter-validation")
  
  implementation("com.google.cloud:spring-cloud-gcp-starter-pubsub")

  implementation("org.springframework.boot:spring-boot-starter-restclient")
  implementation("org.springframework.cloud:spring-cloud-starter-circuitbreaker-resilience4j")
  compileOnly("org.projectlombok:lombok")
  developmentOnly("org.springframework.boot:spring-boot-devtools")
  runtimeOnly("org.postgresql:postgresql")
  annotationProcessor("org.projectlombok:lombok")
  annotationProcessor("org.springframework.boot:spring-boot-configuration-processor")
  
  testImplementation("org.springframework.boot:spring-boot-starter-restclient-test")
  testImplementation("org.springframework.boot:spring-boot-starter-actuator-test")
  testImplementation("org.springframework.boot:spring-boot-starter-data-jpa-test")
  testImplementation("org.springframework.boot:spring-boot-starter-security-oauth2-resource-server-test")
  testImplementation("org.springframework.boot:spring-boot-starter-webmvc-test")
  
  testCompileOnly("org.projectlombok:lombok")
  testRuntimeOnly("org.junit.platform:junit-platform-launcher")
  testAnnotationProcessor("org.projectlombok:lombok")
}

dependencyManagement {
  imports {
    mavenBom("org.springframework.cloud:spring-cloud-dependencies:${property("springCloudVersion")}")
    mavenBom("com.google.cloud:spring-cloud-gcp-dependencies:${property("springCloudGcpVersion")}")
  }
}

tasks.withType<Test> {
  useJUnitPlatform()
}