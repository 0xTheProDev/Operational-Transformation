/**
 * Copyright © 2021 Progyan Bhattacharya
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * See LICENSE file in the root directory for more details.
 */

import { Entity } from "./entity";

interface EntityOptions {
  export?(...args: any[]): string | Element;
  fromElement(element: Element): Record<string, string>;
  getHtml?(...args: any[]): string | Element;
  render?(...args: any[]): string | Element;
  update?(...args: any[]): string | Element;
}

export class EntityManager {
  protected readonly _entities: Record<
    keyof HTMLElementTagNameMap,
    EntityOptions
  >;

  constructor() {
    this._entities = {} as Record<keyof HTMLElementTagNameMap, EntityOptions>;
    this._registerImg();
  }

  register(type: keyof HTMLElementTagNameMap, options: EntityOptions) {
    this._entities[type] = options;
  }

  renderToElement(entity: Entity, entityHandler: any) {
    return this._tryRenderToElement(entity, "render", entityHandler);
  }

  exportToElement(entity: Entity): Element | undefined {
    // Turns out 'export' is a reserved keyword, so 'getHtml' is preferable.
    const element =
      this._tryRenderToElement(entity, "export") ||
      this._tryRenderToElement(entity, "getHtml") ||
      this._tryRenderToElement(entity, "render");
    element?.setAttribute("data-firepad-entity", entity.type);
    return element;
  }

  entitySupportsUpdate(type: keyof HTMLElementTagNameMap): boolean {
    return !!this._entities[type]?.["update"];
  }

  /* Updates a DOM element to reflect the given entity.
     If the entity doesn't support the update method, it is fully
     re-rendered.
  */
  updateElement(entity: Entity, element: Element) {
    const { info, type } = entity;
    if (
      this._entities[type] &&
      typeof this._entities[type].update != "undefined"
    ) {
      this._entities[type]?.update?.(info, element);
    }
  }

  fromElement(element: Element) {
    let type = (element.getAttribute("data-firepad-entity") ??
      element.nodeName.toLowerCase()) as keyof HTMLElementTagNameMap;

    // HACK.  This should be configurable through entity registration.
    if (type && this._entities[type]) {
      const info = this._entities[type].fromElement(element);
      return new Entity(type, info);
    }
  }

  protected _tryRenderToElement(
    entity: Entity,
    renderFn: "export" | "getHtml" | "render",
    entityHandler?: any,
  ): Element | undefined {
    const { info, type } = entity;

    if (this._entities[type] && this._entities[type][renderFn]) {
      const res = this._entities[type]?.[renderFn]?.(
        info,
        entityHandler,
        document,
      );
      if (res) {
        if (typeof res === "string") {
          const div = document.createElement("div");
          div.innerHTML = res;
          return div.childNodes[0] as Element;
        } else if (typeof res === "object") {
          return res;
        }
      }
    }
  }

  protected _registerImg() {
    const attrs = ["src", "alt", "width", "height", "style", "class"];

    this.register("img", {
      render(info: Record<string, string>) {
        let html = "<img ";
        for (const attr of attrs) {
          if (attr in info) {
            html += " " + attr + '="' + info[attr] + '"';
          }
        }
        html += ">";
        return html;
      },
      fromElement(element) {
        const info: Record<string, string> = {};

        for (const attr of attrs) {
          if (element.hasAttribute(attr)) {
            info[attr] = element.getAttribute(attr)!;
          }
        }
        return info;
      },
    });
  }
}
