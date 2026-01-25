package com.project.freelance.freelancing_platform.mapper;

import com.project.freelance.freelancing_platform.dto.RequirementRequest;
import com.project.freelance.freelancing_platform.dto.RequirementResponse;
import com.project.freelance.freelancing_platform.requirement.Requirement;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.Arrays;
import java.util.List;

@Mapper(componentModel = "spring")
public interface RequirementMapper {
    @Mapping(target = "client", ignore = true)
    @Mapping(target = "skills", source = "skills", qualifiedByName = "listToJson")
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Requirement toEntity(RequirementRequest req);

    @Mapping(source = "client.clientId", target = "clientId")
    @Mapping(source = "client.user.firstName", target = "clientName")
    @Mapping(target = "skills", source = "skills", qualifiedByName = "jsonToList")
    @Mapping(target = "totalProposals", ignore = true)
    RequirementResponse toResponse(Requirement r);

    @Named("listToJson")
    default String listToJson(List<String> skills) {
        if (skills == null)
            return null;
        return "[\"" + String.join("\",\"", skills) + "\"]";
    }

    @Named("jsonToList")
    default List<String> jsonToList(String json) {
        if (json == null)
            return List.of();
        String trimmed = json.trim();
        if (trimmed.startsWith("[")) {
            String inner = trimmed.substring(1, trimmed.length() - 1).trim();
            if (inner.isEmpty())
                return List.of();
            return Arrays.stream(inner.split(",")).map(s -> s.replaceAll("^\"|\"$", "").trim()).toList();
        }
        return List.of(json);
    }
}
