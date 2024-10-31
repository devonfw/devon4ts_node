export interface UseCaseGeneratorSchema {
  name: string;
  nameAndDirectoryFormat?: 'as-provided' | 'derived';
  directory?: string;
  skipFormat?: boolean;
  specSameFolder?: boolean;
}
