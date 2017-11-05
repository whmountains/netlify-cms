import yamlFormatter from './yaml';
import tomlFormatter from './toml';
import jsonFormatter from './json';
import FrontmatterFormatter from './frontmatter';

export const formatToExtension = format => ({
  markdown: 'md',
  yaml: 'yml',
  toml: 'toml',
  json: 'json',
  html: 'html',
}[format]);

function formatByType(type) {
  // Right now the only type is "editorialWorkflow" and
  // we always returns the same format
  return FrontmatterFormatter;
}

export function formatByExtension(extension) {
  return {
    yml: yamlFormatter,
    yaml: yamlFormatter,
    toml: tomlFormatter,
    json: jsonFormatter,
    md: FrontmatterFormatter,
    markdown: FrontmatterFormatter,
    html: FrontmatterFormatter,
  }[extension] || FrontmatterFormatter;
}

function formatByName(name) {
  return {
    yml: yamlFormatter,
    yaml: yamlFormatter,
    toml: tomlFormatter,
    frontmatter: FrontmatterFormatter,
  }[name] || FrontmatterFormatter;
}

export function resolveFormat(collectionOrEntity, entry) {
  if (typeof collectionOrEntity === 'string') {
    return formatByType(collectionOrEntity);
  }

  const format = collectionOrEntity.get('format');
  const path = entry && entry.path;

  // If no format is set for the collection, try to infer the format from the file extension.
  if (!format && path) {
    const extension = path.split('.').pop();
    return formatByExtension(extension);
  }

  /**
   * If the format is specified in the collection,
   *  then we will use that format. If it is undefined,
   *  we can still use this function to return the default.
   */
  return formatByName(format);
}
