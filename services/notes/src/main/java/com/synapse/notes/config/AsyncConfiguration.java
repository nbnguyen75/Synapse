package com.synapse.notes.config;

import java.util.concurrent.Executors;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.task.AsyncTaskExecutor;
import org.springframework.core.task.support.TaskExecutorAdapter;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.security.task.DelegatingSecurityContextAsyncTaskExecutor;

@Configuration
@EnableAsync
public class AsyncConfiguration {

  @Bean(name = "applicationTaskExecutor")
  public AsyncTaskExecutor applicationTaskExecutor() {
    var virtualThreadExecutor = Executors.newVirtualThreadPerTaskExecutor();
    var taskExecutorAdapter = new TaskExecutorAdapter(virtualThreadExecutor);

    return new DelegatingSecurityContextAsyncTaskExecutor(taskExecutorAdapter);
  }
}
