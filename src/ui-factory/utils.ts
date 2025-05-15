import { AttributeDef, PRecord, PValue } from './types';

export function resolveEditable({
  def,
  cx = {},
  defaultValue
}: {
  def: AttributeDef;
  cx?: PRecord;
  defaultValue: boolean;
}) {
  return resolveBoolean(def, 'editable', cx, defaultValue);
}

export function resolveBoolean(def: AttributeDef, propertyName: 'editable', cx: PRecord, defaultValue: boolean) {
  if (!def || !propertyName) {
    return defaultValue;
  }
  const propValue = def[propertyName];
  if (typeof propValue === 'boolean') {
    return propValue;
  }
  if (propValue === 'true') {
    return true;
  }
  if (propValue === 'false') {
    return false;
  }
  if (typeof propValue === 'function') {
    return propValue(cx);
  }
  return defaultValue;
}

export function toPRecord<V extends object>(obj: V): PRecord {
  const entries = Object.entries(obj);
  return entries.reduce<PRecord>((a, [key, value]) => {
    let pValue: PValue | undefined = undefined;
    switch (typeof value) {
      case 'string':
      case 'number':
      case 'boolean':
        pValue = value;
        break;
      case 'object':
        pValue = JSON.stringify(value);
        break;
      default:
        pValue = value?.toString ? value.toString() : undefined;
        break;
    }
    if (pValue !== undefined) {
      a[key] = pValue;
    }
    return a;
  }, {});
}
