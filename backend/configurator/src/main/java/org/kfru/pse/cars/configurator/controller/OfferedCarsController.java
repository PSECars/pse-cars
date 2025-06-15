package org.kfru.pse.cars.configurator.controller;

import org.kfru.pse.cars.configurator.model.OfferedCar;
import org.kfru.pse.cars.configurator.repository.OfferedCarRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequestMapping("/offered-cars")
@RestController
public class OfferedCarsController {


  private final OfferedCarRepository offeredCarRepository;

  @Autowired
  public OfferedCarsController(OfferedCarRepository offeredCarRepository) {
    this.offeredCarRepository = offeredCarRepository;
  }

  @GetMapping
  public List<OfferedCar> getOfferedCars() {
    return offeredCarRepository.findAll();
  }

}
