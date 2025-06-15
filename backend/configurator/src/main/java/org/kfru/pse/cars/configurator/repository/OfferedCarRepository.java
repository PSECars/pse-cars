package org.kfru.pse.cars.configurator.repository;

import jakarta.transaction.Transactional;
import org.kfru.pse.cars.configurator.model.OfferedCar;
import org.springframework.data.repository.ListCrudRepository;


@Transactional
public interface OfferedCarRepository extends ListCrudRepository<OfferedCar, Integer> {
}
