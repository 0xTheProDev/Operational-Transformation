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

import { IDisposable, IDisposableCollection } from "@otjs/types";
import {
  createTooltipNode,
  createWidgetNode,
  Disposable,
  DisposableCollection,
} from "@otjs/utils";
import {
  ICursorWidget,
  TCursorWidgetConstructionOptions,
} from "./cursor-widget";

class TooltipMarker {
  public range!: AceAjax.Range;
  public type!: string;
  public clazz!: string;
  public inFront!: boolean;
  public id!: number;

  private readonly _session: AceAjax.IEditSession;
  private readonly _tooltipWidget: HTMLElement;
  private _position: AceAjax.Position;

  /**
   * Constructs a new TooltipMarker
   * @param session The Ace Editor Session to bind to.
   * @param position The row / column coordinate of the cursor marker.
   * @param tooltipWidget The dom node to act as tooltip container.
   */
  constructor(
    session: AceAjax.IEditSession,
    position: AceAjax.Position,
    tooltipWidget: HTMLElement
  ) {
    this._session = session;
    this._position = position;
    this._tooltipWidget = tooltipWidget;

    // Adding tooltip specific styling
    this._tooltipWidget.style.position = "absolute";
    this._tooltipWidget.style.zIndex = "1000";

    // Append tooltip to ace-content div
    const aceContent = document.querySelector(".ace_content");
    aceContent?.append(this._tooltipWidget);
  }

  /**
   * Called by Ace to update the rendering of the marker.
   *
   * @param _ The html to render, represented by an array of strings.
   * @param markerLayer The marker layer containing the cursor marker.
   * @param __ The ace edit session.
   * @param layerConfig
   */
  public update(
    _: string[],
    markerLayer: any,
    __: any,
    layerConfig: any
  ): void {
    if (this._position === null) {
      return;
    }

    const screenPosition = this._session.documentToScreenPosition(
      this._position.row,
      this._position.column
    );

    const top: number = markerLayer.$getTop(screenPosition.row, layerConfig);
    const left: number =
      markerLayer.$padding + screenPosition.column * layerConfig.characterWidth;
    const height: number = layerConfig.lineHeight;

    const cursorTop = top + 2;

    let toolTipTop = cursorTop - height;
    if (toolTipTop < 5) {
      toolTipTop = cursorTop + height - 1;
    }

    this._tooltipWidget.style.top = `${toolTipTop}px`;
    this._tooltipWidget.style.left = `${left}px`;
  }

  /**
   * Sets the location of the cursor marker.
   * @param position The position of cursor marker.
   */
  public setPosition(position: AceAjax.Position): void {
    this._position = position;
    this._forceSessionUpdate();
    this._tooltipWidget.style.opacity = "1";
  }

  private _forceSessionUpdate(): void {
    (this._session as any)._signal("changeFrontMarker");
  }
}

/**
 * Set of Disposable instances.
 */
const disposables = new DisposableCollection();

/**
 * Map of Client Id to Cursor Widgets.
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
  protected readonly _duration: number;
  protected readonly _tooltipClass: string;
  protected readonly _widgetClass: string;
  protected readonly _editor: AceAjax.Editor;

  protected _content: string;
  protected _disposed: boolean = false;
  protected _position: AceAjax.Position | null = null;
  protected _range: AceAjax.Range;
  protected _timer: NodeJS.Timeout | null = null;
  protected _tooltipNode!: HTMLElement;
  protected _widgetNode!: HTMLElement;
  protected _widget!: TooltipMarker;

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
    this._widgetClass = `ace-editor-overlaymessage ${className}-widget`;

    this._init();
  }

  /**
   * Created DOM nodes required and a tooltip marker.
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

    this._widget = new TooltipMarker(
      this._editor.session,
      this._position!,
      this._widgetNode
    );
    this._editor.session.addDynamicMarker(this._widget, true);
    this._widget.setPosition({ row: 1, column: 0 });
  }

  dispose(): void {
    /* istanbul ignore if */
    if (this._disposed === true) {
      return;
    }

    this._cleanupTimer();
    this._editor.session.removeMarker(this._widget.id);
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

  updateRange(range: AceAjax.Range): void {
    if (this._range?.compareRange(range) === 0) {
      return;
    }

    this._range = range;
    this._updateWidgetPosition();
  }

  updateUserName(userName: string): void {
    /* istanbul ignore else */
    if (this._content === userName) {
      return;
    }

    this._tooltipNode.textContent = userName;
    this._content = userName;
  }

  /**
   * Removes any pending timer.
   */
  protected _cleanupTimer(): void {
    /* istanbul ignore if */
    if (this._timer != null) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  }

  /**
   * Sets up timer to hide Tooltip message.
   */
  protected _setupTimer(): void {
    /* istanbul ignore else */
    if (!Number.isFinite(this._duration)) {
      return;
    }

    this._timer = setTimeout(
      /* istanbul ignore next */ () => {
        this._hideTooltip();
        this._timer = null;
      },
      this._duration
    );
  }

  /**
   * Make the tooltip reappear.
   */
  protected _showTooltip(): void {
    this._tooltipNode.style.display = "block";
  }

  /* istanbul ignore next */
  /**
   * Make the tooltip disappear.
   */
  protected _hideTooltip(): void {
    this._tooltipNode.style.display = "none";
  }

  /**
   * Update position of the overall Widget.
   * @param range - Range of the Cursor/Selection in the editor.
   */
  protected _updateWidgetPosition(): void {
    this._position = {
      row: this._range.start.row,
      column: this._range.start.column,
    };

    this._widget.setPosition(this._position);
  }
}

/**
 * @internal
 * Returns a Disposable instance for cleanup.
 * @param options - Contruction Options for the Cursor Widget.
 */
export function createCursorWidget(
  options: TCursorWidgetConstructionOptions
): void {
  const { clientId, range, userName } = options;

  const pastWidget = widgets.get(clientId);

  if (pastWidget != null) {
    pastWidget.updateRange(range);
    pastWidget.updateUserName(userName ?? clientId);
    return;
  }

  const widget = new CursorWidget(options);
  disposables.push(widget);
  widgets.set(clientId, widget);
}

/**
 * @internal
 * Returns a Disposable instance to clean up all the Cursor Widgets.
 */
export function disposeCursorWidgets(): IDisposable {
  return Disposable.create(() => {
    widgets.clear();
    disposables.dispose();
  });
}
