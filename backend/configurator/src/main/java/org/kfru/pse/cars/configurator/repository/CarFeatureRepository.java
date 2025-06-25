package org.kfru.pse.cars.configurator.repository;

import jakarta.transaction.Transactional;
import org.kfru.pse.cars.configurator.model.CarFeature;
import org.springframework.data.repository.ListCrudRepository;


@Transactional
public interface CarFeatureRepository extends ListCrudRepository<CarFeature, Integer> {
}
