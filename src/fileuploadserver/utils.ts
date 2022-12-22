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

  static loadHtml = (url: string, element: HTMLElement): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      xhr.onload = () => {
        if (xhr.status == 200) {
          element.innerHTML = xhr.responseText;
          resolve();
        } else {
          console.error(`Failed to load HTML from [${url}].`);
          reject(xhr.status);
        }
      };
      xhr.send();
    });
  }
}