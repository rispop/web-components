import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';


@customElement('lis-pagination-element')
export class LisPaginationElement extends LitElement {

  // disable shadow DOM
  override createRenderRoot() {
    return this;
  }

  @property({type: Number})
  page: number = 1;

  // go to the previous page
  private _previous(e: MouseEvent) {
    e.preventDefault();
    if (this.page > 1) {
      this.page -= 1;
      this._dispatchPageChange();
    }
  }

  // go to the next page
  private _next(e: MouseEvent) {
    e.preventDefault();
    this.page += 1;
    this._dispatchPageChange();
  }

  // emits a 'pageChange' event
  private _dispatchPageChange() {
    const options = {
      detail: {page: this.page},
      bubbles: true,
      composed: true
    };
    this.dispatchEvent(new CustomEvent('pageChange', options));
  }

  override render() {
    return html`
      <ul class="uk-pagination">
          <li><a href="" @click=${this._previous}><span class="uk-margin-small-right" uk-pagination-previous></span> Previous</a></li>
          <li class="uk-active"><span>Page ${this.page}</span></li>
          <li class="uk-margin-auto-left"><a href="" @click=${this._next}>Next <span class="uk-margin-small-left" uk-pagination-next></span></a></li>
      </ul>
    `;
  }

}


declare global {
  interface HTMLElementTagNameMap {
    'lis-pagination-element': LisPaginationElement;
  }
}