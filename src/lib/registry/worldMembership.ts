/**
 * World Membership Logic
 * 
 * Matches artifacts to worlds based on their tokens (e.g., "3DT", "AKIRA_CODEX")
 */

export interface Artifact {
  id: string;
  name: string;
  tokens?: string[];
  [key: string]: any;
}

/**
 * Determines which worlds an artifact belongs to based on token matching
 * @param artifact The artifact to check
 * @param worlds List of available worlds with their tokens
 * @returns Array of world IDs that the artifact belongs to
 */
export function matchArtifactToWorlds(
  artifact: Artifact,
  worlds: Array<{ id: string; tokens: string[] }>
): string[] {
  if (!artifact.tokens || artifact.tokens.length === 0) {
    return [];
  }

  const matchedWorlds: string[] = [];

  for (const world of worlds) {
    // Check if any of the artifact's tokens match any of the world's tokens
    const hasMatch = artifact.tokens.some(artifactToken =>
      world.tokens.includes(artifactToken)
    );

    if (hasMatch) {
      matchedWorlds.push(world.id);
    }
  }

  return matchedWorlds;
}

/**
 * Checks if an artifact belongs to a specific world
 * @param artifact The artifact to check
 * @param worldTokens The tokens of the world to check against
 * @returns True if the artifact belongs to the world
 */
export function belongsToWorld(artifact: Artifact, worldTokens: string[]): boolean {
  if (!artifact.tokens || artifact.tokens.length === 0) {
    return false;
  }

  return artifact.tokens.some(artifactToken =>
    worldTokens.includes(artifactToken)
  );
}

/**
 * Parses tokens from a JSON string
 * @param tokensJson JSON string of tokens
 * @returns Array of token strings
 */
export function parseTokens(tokensJson: string): string[] {
  try {
    const parsed = JSON.parse(tokensJson);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
}
