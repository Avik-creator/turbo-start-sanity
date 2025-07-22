import React, { useState, useCallback } from "react";
import { set, unset } from "sanity";
import { ObjectInputProps } from "sanity";
import {
  Card,
  Stack,
  Text,
  TextInput,
  Button,
  Spinner,
  Flex,
  Avatar,
  Badge,
} from "@sanity/ui";
import { SearchIcon, TrashIcon } from "@sanity/icons";

interface Pokemon {
  id: number;
  name: string;
  types: string[];
  sprite: string;
}

interface PokemonValue {
  id?: number;
  name?: string;
  types?: string[];
  sprite?: string;
}

export default function PokemonSelector(props: ObjectInputProps) {
  const { value, onChange } = props;
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Debounce function
  const debounce = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  }, []);

  // Search function
  const searchPokemon = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      // Skip very short queries to avoid unnecessary API calls
      if (searchQuery.trim().length < 5) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError("");

      try {
        // Clean and normalize the search query
        const cleanQuery = searchQuery.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
        
        if (!cleanQuery) {
          throw new Error("Invalid Pokémon name format");
        }

        const response = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${cleanQuery}`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
            // Add timeout to prevent hanging requests
            signal: AbortSignal.timeout(10000) // 10 second timeout
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(`"${searchQuery}" not found. Try exact Pokémon names like "pikachu" or "charizard"`);
          } else if (response.status >= 500) {
            throw new Error("PokeAPI server error. Please try again in a moment.");
          } else {
            throw new Error(`API error (${response.status}). Please try again.`);
          }
        }

        const data = await response.json();
        
        // Validate the response data
        if (!data || !data.id || !data.name || !data.types || !Array.isArray(data.types)) {
          throw new Error("Invalid data received from API. Please try again.");
        }

        const pokemon: Pokemon = {
          id: data.id,
          name: data.name,
          types: data.types.map((t: any) => t?.type?.name).filter(Boolean),
          sprite: data.sprites?.front_default || data.sprites?.other?.['official-artwork']?.front_default || '',
        };

        // Validate pokemon data before setting results
        if (!pokemon.sprite) {
          throw new Error("No image available for this Pokémon");
        }

        setResults([pokemon]);
      } catch (err) {
        console.error('Pokemon search error:', err);
        
        if (err instanceof Error) {
          if (err.name === 'AbortError' || err.name === 'TimeoutError') {
            setError("Search timed out. Please check your connection and try again.");
          } else {
            setError(err.message);
          }
        } else {
          setError("An unexpected error occurred. Please try again.");
        }
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    searchPokemon(newQuery);
  };

  // Handle pokemon selection
  const handleSelect = (pokemon: Pokemon) => {
    onChange(set(pokemon));
    setQuery("");
    setResults([]);
  };

  // Handle removal
  const handleRemove = () => {
    onChange(unset());
  };

  return (
    <Card padding={3} radius={2} shadow={1}>
      <Stack space={4}>
        {/* Search Input */}
        <Stack space={2}>
          <Text size={1} weight="medium">
            Search Pokémon
          </Text>
          <TextInput
            icon={SearchIcon}
            placeholder="Type a Pokémon name (e.g., pikachu, charizard)..."
            value={query}
            onChange={handleInputChange}
          />
        </Stack>

        {/* Loading State */}
        {loading && (
          <Card padding={3} tone="transparent">
            <Flex align="center" gap={2}>
              <Spinner muted />
              <Text muted size={1}>
                Searching for Pokémon...
              </Text>
            </Flex>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card padding={3} tone="critical" radius={2}>
            <Text size={1}>{error}</Text>
          </Card>
        )}

        {/* Search Results */}
        {results.length > 0 && (
          <Stack space={2}>
            {results.map((pokemon) => (
              <Card
                key={pokemon.id}
                padding={3}
                radius={2}
                tone="transparent"
                as="button"
                onClick={() => handleSelect(pokemon)}
                style={{ 
                  cursor: "pointer", 
                  border: "1px solid var(--card-border-color)",
                  textAlign: "left"
                }}
              >
                <Flex align="center" gap={3}>
                  <Avatar
                    src={pokemon.sprite}
                    alt={pokemon.name}
                    size={2}
                  />
                  <Stack space={1} flex={1}>
                    <Text weight="medium" style={{ textTransform: "capitalize" }}>
                      {pokemon.name}
                    </Text>
                    <Flex gap={1} wrap="wrap">
                      {pokemon.types.map((type) => (
                        <Badge key={type} tone="primary" mode="outline">
                          {type}
                        </Badge>
                      ))}
                    </Flex>
                    <Text muted size={0}>
                      ID: #{pokemon.id}
                    </Text>
                  </Stack>
                </Flex>
              </Card>
            ))}
          </Stack>
        )}

        {/* Selected Pokemon Display */}
        {value && (
          <Card padding={4} tone="primary" radius={2}>
            <Stack space={3}>
              <Flex justify="space-between" align="center">
                <Text weight="semibold" size={2}>
                  Selected Pokémon
                </Text>
                <Button
                  icon={TrashIcon}
                  tone="critical"
                  mode="ghost"
                  onClick={handleRemove}
                  text="Remove"
                />
              </Flex>
              
              <Flex align="center" gap={3}>
                <Avatar
                  src={value.sprite}
                  alt={value.name}
                  size={3}
                />
                <Stack space={2} flex={1}>
                  <Text 
                    weight="semibold" 
                    size={3}
                    style={{ textTransform: "capitalize" }}
                  >
                    {value.name}
                  </Text>
                  <Flex gap={1} wrap="wrap">
                    {value.types?.map((type: string) => (
                      <Badge key={type} tone="primary">
                        {type}
                      </Badge>
                    ))}
                  </Flex>
                  <Text muted size={1}>
                    ID: #{value.id}
                  </Text>
                </Stack>
              </Flex>
            </Stack>
          </Card>
        )}
      </Stack>
    </Card>
  );
}