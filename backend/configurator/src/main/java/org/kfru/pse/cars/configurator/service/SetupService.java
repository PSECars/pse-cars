package org.kfru.pse.cars.configurator.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.extern.java.Log;
import org.kfru.pse.cars.configurator.model.OfferedCar;
import org.kfru.pse.cars.configurator.repository.CarFeatureRepository;
import org.kfru.pse.cars.configurator.repository.OfferedCarRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;

@Service
@Log
public class SetupService {

  @Value("classpath:data/offered-cars.json")
  Resource offeredCarsFile;

  private final ObjectMapper objectMapper = new ObjectMapper();
  private final OfferedCarRepository offeredCarRepository;
  private final CarFeatureRepository carFeatureRepository;

  @Autowired
  SetupService(OfferedCarRepository offeredCarRepository, CarFeatureRepository carFeatureRepository) {
    this.offeredCarRepository = offeredCarRepository;
    this.carFeatureRepository = carFeatureRepository;
  }

  @PostConstruct
  public void setupOfferedCars() {
    if (offeredCarRepository.count() > 0) {
      log.info("Offered cars already exist in the database, skipping setup.");
      return;
    }
    try (InputStream inputStream = offeredCarsFile.getInputStream()) {
      JsonNode offeredCarsJson = objectMapper.readTree(inputStream);
      if (!offeredCarsJson.isArray()) {
        throw new IllegalArgumentException("Unexpected JSON format.");
      }
      offeredCarsJson.forEach(offeredCarJson -> {
        try {
          OfferedCar newOfferedCar = objectMapper.treeToValue(offeredCarJson, OfferedCar.class);
          if (newOfferedCar.getFeatures() != null && !newOfferedCar.getFeatures().isEmpty()) {
            carFeatureRepository.saveAll(newOfferedCar.getFeatures());
          }
          offeredCarRepository.save(newOfferedCar);
        } catch (IOException e) {
          throw new RuntimeException("Failed to parse offered car JSON", e);
        }
      });
    } catch (IOException e) {
      throw new RuntimeException("Failed to load offered cars from JSON", e);
    }
    log.info("Offered cars setup completed successfully.");
  }
}
