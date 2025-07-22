import { defineType } from "sanity";
import PokemonSelector from "../../components/pokemon-selector";

export const pokemon = defineType({
  name: "pokemon",
  title: "Pokémon",
  type: "object",
  components: {
    input: PokemonSelector,
  },
  fields: [
    { name: "id", type: "number", title: "Pokémon ID", readOnly: true },
    { name: "name", type: "string", title: "Name", readOnly: true },
    { name: "types", type: "array", title: "Types", of: [{ type: "string" }], readOnly: true },
    { name: "sprite", type: "url", title: "Sprite URL", readOnly: true },
  ],
  preview: {
    select: { title: "name", media: "sprite" }
  }
});