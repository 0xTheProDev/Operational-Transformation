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

export class TooltipMarker {
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

  /**
   * Force triggers the changeFrontMarker event
   */
  private _forceSessionUpdate(): void {
    (this._session as any)._signal("changeFrontMarker");
  }
}
