export class Utils {
  static getUniqueChildByClassName = (
    parentElement: HTMLElement, className: string): HTMLElement => {
    const elements = parentElement.getElementsByClassName(className);
    console.assert(elements.length > 0,
      `No child with classname=[${className}] found.}`);
    console.assert(elements.length < 2,
      `Child with classname=[${className}] is not unique.}`);
    return elements[0] as HTMLElement;
  }
}