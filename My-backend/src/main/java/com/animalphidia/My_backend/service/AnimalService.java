package com.animalphidia.My_backend.service;

import com.animalphidia.My_backend.dto.AnimalDTO;
import com.animalphidia.My_backend.model.*;
import com.animalphidia.My_backend.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AnimalService {

    private static final Logger log = LoggerFactory.getLogger(AnimalService.class);

    @Autowired
    private AnimalRepository animalRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SpeciesRepository speciesRepository;

    @Autowired
    private KingdomRepository kingdomRepository;

    @Autowired
    private PhylumRepository phylumRepository;

    @Autowired
    private ClassTaxRepository classTaxRepository;

    @Autowired
    private AnimalOrderRepository animalOrderRepository;

    @Autowired
    private FamilyRepository familyRepository;

    @Autowired
    private GenusRepository genusRepository;

    @Autowired
    private ConservationStatusRepository conservationStatusRepository;

    @Autowired
    private DietRepository dietRepository;

    public Page<AnimalDTO> getAllAnimals(Pageable pageable) {
        return animalRepository.findByActiveTrue(pageable).map(this::convertToDTO);
    }

    public Page<AnimalDTO> getUnverifiedAnimals(Pageable pageable) {
        return animalRepository.findByIsVerifiedFalse(pageable)
                .map(this::convertToDTO);
    }

    public Page<AnimalDTO> getFeaturedAnimals(Pageable pageable) {
        return animalRepository.findFeaturedAnimals(pageable).map(this::convertToDTO);
    }

    public Optional<AnimalDTO> getAnimalById(Integer id) {
        return animalRepository.findById(id).map(this::convertToDTO);
    }

    public Optional<AnimalDTO> getAnimalByScientificName(String scientificName) {
        return animalRepository.findByScientificNameIgnoreCase(scientificName).map(this::convertToDTO);
    }

    public Optional<AnimalDTO> getAnimalByCommonName(String commonName) {
        return animalRepository.findByCommonNameIgnoreCase(commonName).map(this::convertToDTO);
    }

    public List<AnimalDTO> getAnimalsByRegion(String region) {
        return animalRepository.findByRegionIgnoreCase(region).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<AnimalDTO> getAnimalsByIsland(String island) {
        return animalRepository.findByIslandIgnoreCase(island).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<AnimalDTO> getAnimalsByConservationStatus(String status) {
        return animalRepository.findByConservationStatusAndActive(status).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Page<AnimalDTO> searchAnimals(String keyword, Pageable pageable) {
        return animalRepository.searchByKeyword(keyword, pageable).map(this::convertToDTO);
    }

    public Page<AnimalDTO> getAnimalsByStatus(String status, Pageable pageable) {
        switch (status.toUpperCase()) {
            case "PENDING":
                return animalRepository.findByIsVerifiedFalse(pageable)
                        .map(this::convertToDTO);
            case "VERIFIED":
                return animalRepository.findByIsVerifiedTrue(pageable)
                        .map(this::convertToDTO);
            case "ACTIVE":
                return animalRepository.findByActiveTrue(pageable)
                        .map(this::convertToDTO);
            default:
                return animalRepository.findAll(pageable)
                        .map(this::convertToDTO);
        }
    }

    public AnimalDTO createAnimal(AnimalDTO animalDTO) {
        Animal animal = convertToEntity(animalDTO);
        animal.setVerified(false);
        animal.setIsVerified(false);
        animal.setActive(true);
        animal.setCreatedAt(LocalDateTime.now());
        animal.setUpdatedAt(LocalDateTime.now());

        Animal savedAnimal = animalRepository.save(animal);
        log.info("Animal created: {}", savedAnimal.getCommonName());
        return convertToDTO(savedAnimal);
    }

    // NEW METHOD: Create animal with user ID
    public AnimalDTO createAnimal(AnimalDTO animalDTO, Integer userId) {
        Animal animal = convertToEntity(animalDTO);
        animal.setVerified(false);
        animal.setIsVerified(false);
        animal.setActive(true);
        animal.setCreatedAt(LocalDateTime.now());
        animal.setUpdatedAt(LocalDateTime.now());

        if (userId != null) {
            animal.setCreatedBy(userId);
            animal.setUpdatedBy(userId);
        }

        Animal savedAnimal = animalRepository.save(animal);
        log.info("Animal submitted by user {}: {}", userId, savedAnimal.getCommonName());
        return convertToDTO(savedAnimal);
    }

    public AnimalDTO updateAnimal(Integer id, AnimalDTO animalDTO) {
        Optional<Animal> animalOptional = animalRepository.findById(id);

        if (animalOptional.isEmpty()) {
            throw new IllegalArgumentException("Animal not found with id: " + id);
        }

        Animal animal = animalOptional.get();
        updateAnimalFields(animal, animalDTO);

        animal.setUpdatedAt(LocalDateTime.now());

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByUsernameIgnoreCase(username);
            userOpt.ifPresent(user -> {
                animal.setUpdatedBy(user.getId());
            });
        }

        Animal updatedAnimal = animalRepository.save(animal);
        log.info("Animal updated: {}", updatedAnimal.getCommonName());
        return convertToDTO(updatedAnimal);
    }

    public void deleteAnimal(Integer id) {
        if (!animalRepository.existsById(id)) {
            throw new IllegalArgumentException("Animal not found with id: " + id);
        }

        animalRepository.deleteById(id);
        log.info("Animal deleted with id: {}", id);
    }

    public AnimalDTO verifyAnimal(Integer id) {
        Optional<Animal> animalOptional = animalRepository.findById(id);

        if (animalOptional.isEmpty()) {
            throw new IllegalArgumentException("Animal not found with id: " + id);
        }

        Animal animal = animalOptional.get();
        animal.setIsVerified(true);
        animal.setVerified(true);
        animal.setUpdatedAt(LocalDateTime.now());

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByUsernameIgnoreCase(username);
            userOpt.ifPresent(user -> {
                animal.setUpdatedBy(user.getId());
            });
        }

        Animal verified = animalRepository.save(animal);
        log.info("Animal verified: {}", verified.getCommonName());
        return convertToDTO(verified);
    }

    // NEW METHOD: Reject animal
    public void rejectAnimal(Integer id, String reason) {
        Optional<Animal> animalOptional = animalRepository.findById(id);

        if (animalOptional.isEmpty()) {
            throw new IllegalArgumentException("Animal not found with id: " + id);
        }

        Animal animal = animalOptional.get();
        animal.setActive(false);
        animal.setVerificationNotes(reason);
        animal.setUpdatedAt(LocalDateTime.now());

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByUsernameIgnoreCase(username);
            userOpt.ifPresent(user -> {
                animal.setUpdatedBy(user.getId());
            });
        }

        animalRepository.save(animal);
        log.info("Animal rejected: {} - Reason: {}", animal.getCommonName(), reason);
    }

    // NEW METHOD: Get animals for contributor (their own + verified)
    public Page<AnimalDTO> getAllAnimalsForContributor(Pageable pageable, Integer userId) {
        return animalRepository.findByActiveTrueAndVerifiedOrUser(userId, pageable)
                .map(this::convertToDTO);
    }

    private AnimalDTO convertToDTO(Animal animal) {
        AnimalDTO dto = new AnimalDTO();
        dto.id = animal.getAnimalId();
        dto.commonName = animal.getCommonName();
        dto.scientificName = animal.getScientificName();
        dto.description = animal.getDescription();
        dto.characteristics = animal.getCharacteristics();
        dto.habitat = animal.getHabitat();
        dto.behavior = animal.getBehavior();
        dto.diet = animal.getDietString();
        dto.reproduction = animal.getReproduction();
        dto.conservationStatus = animal.getConservationStatusString();
        dto.region = animal.getRegion();
        dto.island = animal.getIsland();
        dto.populationEstimate = animal.getPopulationEstimate();
        dto.imageUrl = animal.getImageUrl();
        dto.tags = animal.getTags();
        dto.verified = animal.getVerified();
        dto.isVerified = animal.getIsVerified();
        dto.active = animal.getActive();
        dto.createdAt = animal.getCreatedAt();
        dto.updatedAt = animal.getUpdatedAt();
        dto.conservationStatusId = animal.getConservationStatusId();
        dto.dietId = animal.getDietId();
        return dto;
    }

    private Animal convertToEntity(AnimalDTO dto) {
        Animal animal = new Animal();
        animal.setCommonName(dto.commonName);
        animal.setScientificName(dto.scientificName);
        animal.setDescription(dto.description);
        animal.setCharacteristics(dto.characteristics);
        animal.setHabitat(dto.habitat);
        animal.setBehavior(dto.behavior);
        animal.setReproduction(dto.reproduction);
        animal.setRegion(dto.region);
        animal.setIsland(dto.island);
        animal.setPopulationEstimate(dto.populationEstimate);
        animal.setImageUrl(dto.imageUrl);
        animal.setTags(dto.tags);
        animal.setVerified(dto.verified != null ? dto.verified : false);
        animal.setIsVerified(dto.isVerified != null ? dto.isVerified : false);
        animal.setActive(dto.active != null ? dto.active : true);

        animal.setConservationStatusString(dto.conservationStatus);
        animal.setDietString(dto.diet);

        if (dto.conservationStatusId != null) {
            animal.setConservationStatusId(dto.conservationStatusId);
        }
        if (dto.dietId != null) {
            animal.setDietId(dto.dietId);
        }

        return animal;
    }

    private void updateAnimalFields(Animal animal, AnimalDTO dto) {
        if (dto.commonName != null) animal.setCommonName(dto.commonName);
        if (dto.scientificName != null) animal.setScientificName(dto.scientificName);
        if (dto.description != null) animal.setDescription(dto.description);
        if (dto.characteristics != null) animal.setCharacteristics(dto.characteristics);
        if (dto.habitat != null) animal.setHabitat(dto.habitat);
        if (dto.behavior != null) animal.setBehavior(dto.behavior);
        if (dto.reproduction != null) animal.setReproduction(dto.reproduction);
        if (dto.region != null) animal.setRegion(dto.region);
        if (dto.island != null) animal.setIsland(dto.island);
        if (dto.populationEstimate != null) animal.setPopulationEstimate(dto.populationEstimate);
        if (dto.imageUrl != null) animal.setImageUrl(dto.imageUrl);
        if (dto.tags != null) animal.setTags(dto.tags);
        if (dto.verified != null) animal.setVerified(dto.verified);
        if (dto.isVerified != null) animal.setIsVerified(dto.isVerified);
        if (dto.active != null) animal.setActive(dto.active);
        if (dto.conservationStatus != null) animal.setConservationStatusString(dto.conservationStatus);
        if (dto.diet != null) animal.setDietString(dto.diet);
        if (dto.conservationStatusId != null) animal.setConservationStatusId(dto.conservationStatusId);
        if (dto.dietId != null) animal.setDietId(dto.dietId);
    }
}
