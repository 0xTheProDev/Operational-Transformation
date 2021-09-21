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

import * as monaco from "monaco-editor";
import { IDisposable, IDisposableCollection } from "@otjs/types";
import { Disposable, DisposableCollection } from "@otjs/utils";
import {
  ICursorWidget,
  TCursorWidgetConstructionOptions,
} from "./cursor-widget";
import { createTooltipNode, createWidgetNode } from "./styles";

/**
 * Map of Client Id to Dispose method of Cursor Widget.
 */
const widgets: Map<string, ICursorWidget> = new Map();

/**
 * @internal
 * Cursor Widget - To show tooltip like UI with Username beside Cursor.
 * @param constructorOptions - Constructor options for Cursor Widget.
 */
class CursorWidget implements ICursorWidget {
  protected readonly _toDispose: IDisposableCollection =
    new DisposableCollection();

  protected readonly _id: string;
  protected readonly _content: string;
  protected readonly _duration: number;
  protected readonly _tooltipClass: string;
  protected readonly _widgetClass: string;
  protected readonly _editor: monaco.editor.IStandaloneCodeEditor;

  protected _disposed: boolean = false;
  protected _position: monaco.editor.IContentWidgetPosition | null = null;
  protected _range: monaco.Range;
  protected _tooltipNode!: HTMLElement;
  protected _widgetNode!: HTMLElement;

  constructor({
    clientId,
    className,
    duration,
    editor,
    range,
    userName,
  }: TCursorWidgetConstructionOptions) {
    this._id = clientId;
    this._range = range;
    this._editor = editor;
    this._content = userName ?? clientId;
    this._duration = duration;
    this._tooltipClass = `${className}-tooltip`;
    this._widgetClass = `${className}-widget`;

    this._init();
  }

  /**
   * Created DOM nodes required and binds them as Content Widget to the editor.
   */
  protected async _init(): Promise<void> {
    this._tooltipNode = await createTooltipNode({
      className: this._tooltipClass,
      textContent: this._content,
    });
    this._widgetNode = await createWidgetNode({
      className: this._widgetClass,
      childElement: this._tooltipNode,
    });

    this._toDispose.push(
      this._editor.onDidScrollChange(() => {
        this._updateTooltipPosition();
      })
    );

    this._updateWidgetPosition();
    this._editor.addContentWidget(this);
  }

  dispose(): void {
    if (this._disposed === true) {
      return;
    }

    this._editor.removeContentWidget(this);
    this._toDispose.dispose();

    // @ts-expect-error
    this._tooltipNode = null;

    // @ts-expect-error
    this._widgetNode = null;

    // @ts-expect-error
    this._editor = null;
    this._position = null;

    this._disposed = true;
  }

  getId(): string {
    return this._id;
  }

  getDomNode(): HTMLElement {
    return this._widgetNode;
  }

  getPosition(): monaco.editor.IContentWidgetPosition | null {
    return this._position;
  }

  updateRange(range: monaco.Range): void {
    if (this._range === range) {
      return;
    }

    this._range = range;
    this._updateWidgetPosition();
  }

  updateUserName(userName: string): void {
    if (this._content === userName) {
      return;
    }

    this._tooltipNode.textContent = userName;
  }

  /**
   * Make the tooltip disappear.
   */
  protected _showTooltip(): void {
    this._tooltipNode.style.display = "block";
  }

  /**
   * Make the tooltip disappear.
   */
  protected _hideTooltip(): void {
    this._tooltipNode.style.display = "none";
  }

  /**
   * Change position of the tooltip.
   */
  protected _updateTooltipPosition(): void {
    const distanceFromTop =
      this._widgetNode.offsetTop - this._editor.getScrollTop();

    this._tooltipNode.style.top =
      distanceFromTop - this._tooltipNode.offsetHeight < 5
        ? `${this._tooltipNode.offsetHeight - 2}px`
        : `-${this._tooltipNode.offsetHeight - 4}px`;

    this._tooltipNode.style.left = "0";
  }

  /**
   * Update position of the overall Widget.
   * @param range - Range of the Cursor/Selection in the editor.
   */
  protected _updateWidgetPosition(): void {
    this._position = {
      position: this._range.getEndPosition(),
      preference: [
        monaco.editor.ContentWidgetPositionPreference.ABOVE,
        monaco.editor.ContentWidgetPositionPreference.BELOW,
      ],
    };

    this._editor.layoutContentWidget(this);

    if (!Number.isFinite(this._duration)) {
      return;
    }

    this._showTooltip();
    let timer: NodeJS.Timeout | null = setTimeout(() => {
      this._hideTooltip();
      timer = null;
    }, this._duration);

    this._toDispose.push(
      Disposable.create(() => {
        if (timer !== null) {
          clearTimeout(timer);
        }
      })
    );
  }
}

/**
 * @internal
 * Returns a Disposable instance for cleanup.
 * @param options - Contruction Options for the Cursor Widget.
 */
export function createCursorWidget(
  options: TCursorWidgetConstructionOptions
): IDisposable {
  const { clientId, range, userName } = options;

  const pastWidget = widgets.get(clientId);

  if (pastWidget != null) {
    pastWidget.updateRange(range);
    pastWidget.updateUserName(userName ?? clientId);
    return Disposable.create(() => {});
  }

  const widget = new CursorWidget(options);
  const disposable = Disposable.create(() => {
    widget.dispose();
    widgets.delete(clientId);
  });
  widgets.set(clientId, widget);

  return disposable;
}
