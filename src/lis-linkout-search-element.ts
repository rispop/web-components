import {LitElement, html, css} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import {LisSimpleTableElement} from './core';


/**
 * The data that will be sent to the search function by the
 * {@link LisLinkoutSearchElement | `LisLinkoutSearchElement`} class when a search is
 * performed.
 */
export type LinkoutSearchData = {
  query: string;
  service: string;
}

/**
 * The data that will be returned to the search function by the
 * {@link LisLinkoutSearchElement | `LisLinkoutSearchElement`} class when a search is
 * performed.
 */
export type LinkoutResult = {
  href: string;
  text: string;
  method: string;
}

/**
 * The signature of the function the
 * {@link LisLinkoutSearchElement | `LisLinkoutSearchElement`} class requires for
 * performing a gene search.
 *
 * @param queryString The search term sent to the linkout function/
 * @param service The service used by the linkout function.
 *
 * @returns A {@link !Promise | `Promise`} that resolves to an
 * {@link !Array | `Array`} of {@link LinkoutResult | `LinkoutResult`}
 * objects.
 */
export type LinkoutSearchFunction<LinkoutSearchData, LinkoutResult> =
  (searchData: LinkoutSearchData) =>
    Promise<Array<LinkoutResult>>;

/**
 * @htmlElement `<lis-linkout-search-element>`
 *
 * A Web Component that provides an interface for performing "full yuck" queries
 * against an instance of the lis linkout microservice. 
 * The results from this are displayed in a table with button linkouts.
 *
 * @queryStringParameters
 * - **queryString:** The string to be used by the linkout search function.
 * - **service:** The service to be used by the linkout search function.
 *
 * @example
 * {@link !HTMLElement | `HTMLElement`} properties can only be set via
 * JavaScript. This means the {@link searchFunction | `searchFunction`} property
 * must be set on a `<lis-linkout-search-element>` tag's instance of the
 * {@link LisLinkoutSearchElement | `LisLinkoutSearchElement`} class. For example:
 * ```html
 *    <a class="uk-button uk-button-default" href="#test-linkout" type="submit" uk-toggle>Open</a>
 *    <lis-modal-element modalId="test-linkout">
 *      <lis-linkout-search-element
 *        id="linkout-search">
 *      </lis-linkout-search-element>
 *    </lis-modal-element>
 *
 *    <!-- set the search function by property because functions can't be set as attributes -->
 *    <script type="text/javascript">
 *      const linkoutSearchElement = document.getElementById('linkout-search');
 *      linkoutSearchElement.linkoutFunction = getLinkouts;
 *      window.onload = (event) => {
 *        linkoutSearchElement.queryString = 'genes=cicar.CDCFrontier.gnm3.ann1.Ca1g000600';
 *      }
 *   </script>
 * ```
 */
@customElement('lis-linkout-search-element')
export class LisLinkoutSearchElement extends LitElement {

  /** @ignore */
  // used by Lit to style the Shadow DOM
  // not necessary but exclusion breaks TypeDoc
  static override styles = css``;

  /** @ignore */
  // disable Shadow DOM to inherit global styles
  override createRenderRoot() {
    return this;
  }

  /** @ignore */
  // overrides the default attributeChangedCallback to add this._fetchLinkouts() after constructor callback
  override attributeChangedCallback(name: string, oldVal: string | null, newVal: string | null) {
    super.attributeChangedCallback(name, oldVal, newVal);
    this._fetchLinkouts();
  }

  /**
   * The query string for the linkout service.
   * Reflect is true so that the attribute will trigger
   * when set with JS
   *
   * @attribute
   */
  @property({type: String, reflect: true})
  queryString: string = '';

  /**
   * The service to use from the linkout service. default: gene_linkouts
   *
   * @attribute
   */
  @property({type: String})
  service: string = 'gene_linkouts';

  // the search callback function; not an attribute because functions can't be
  // parsed from attributes
  @property({type: Function, attribute: false})
  linkoutFunction: LinkoutSearchFunction<LinkoutSearchData, LinkoutResult> =
    () => Promise.reject(new Error('No search function provided'));

  // bind to the table element in the template
  @query('lis-simple-table-element')
  private _table!: LisSimpleTableElement;

  /** @ignore */
  // Maps Array of LinkoutResult objects, d, to return a simple linkout object
  // ({linkout: `<a href="${d.href}">${d.text}.</a>`})
  private _mapLinkouts(data: LinkoutResult[]) {
    return data.map((d: LinkoutResult) => ({linkout: `<a href="${d.href}">${d.text}.</a>`}));
  }

  /** @ignore */
  // Fetches results from the linkout service and returns an Array of objects containing hyperlinks
  private _fetchLinkouts() {
    if(!this.queryString){
      return html``;
    }
    const linkoutData = {query: this.queryString, service: this.service};
    return this.linkoutFunction(linkoutData).then((data) => {
                                                              const results = this._mapLinkouts(data);
                                                              this._table.data = results;
                                                              return data;
                                                             });
  }

  /** @ignore */
  // used by Lit to draw the template
  override render() {

    // compute table parts
    const dataAttributes = ['linkout']
    const header = {'linkout': 'Linkouts'};
    // draw the table
    return html`
      <lis-simple-table-element
        caption=""
        .dataAttributes=${dataAttributes}
        .header=${header}>
      </lis-simple-table-element>
      <slot></slot>
    `;
  }
}


declare global {
  interface HTMLElementTagNameMap {
    'lis-linkout-search-element': LisLinkoutSearchElement;
  }
}
