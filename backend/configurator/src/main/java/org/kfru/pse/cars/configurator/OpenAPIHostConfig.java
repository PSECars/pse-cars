package org.kfru.pse.cars.configurator;

import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Service;
import org.springframework.web.filter.ForwardedHeaderFilter;

/**
 * Config for reverse proxy support.
 */
@Service
public class OpenAPIHostConfig {
  @Bean
  ForwardedHeaderFilter forwardedHeaderFilter() {
    return new ForwardedHeaderFilter();
  }

}
