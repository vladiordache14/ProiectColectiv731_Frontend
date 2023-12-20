import {AfterContentChecked, AfterViewChecked, AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {Advert} from "../advert";
import {AdvertService} from "../service/advert.service";
import { ElementRef } from '@angular/core';
import { DataSharingService } from '../service/data-sharing.service';
import { MatDialog } from "@angular/material/dialog";
import { CartDialogComponent } from "../../cart-dialog/components/cart-dialog.component";

@Component({
  selector: 'app-adverts',
  providers: [AdvertService],
  templateUrl: './adverts.component.html',
  styleUrls: ['./adverts.component.css']
})
export class AdvertsComponent implements OnInit, AfterContentChecked{
  adverts: Advert[] = [];
  counter = 0;
  advertsInCart: Advert[] = [];
  public cartDataKey = 'cartData';

  constructor(private dataSharingService: DataSharingService,
    private advertService: AdvertService,
     private el: ElementRef, private dialog: MatDialog) { }

  ngOnInit(): void {

    // Clear the localStorage when the page is refreshed
    localStorage.removeItem(this.cartDataKey);

    this.advertService.getActiveAdverts().subscribe(adverts => {
      for (let advert of adverts) {
        advert.selectedIndex = 0;
      }
      this.adverts = adverts;
    });

  }

  ngAfterContentChecked(): void {
      const elementsWithClass = this.filterElementsByUsername(' Daniel ', 'adverts-container', 'advert-seller-username');
      const buttons = this.el.nativeElement.querySelector('.unusable').outerHTML;
      const modifiedButtons = buttons.replace('unusable', 'usable');
      const filteredHtmlContent = Array.from(elementsWithClass)
      .map((element: HTMLElement) => this.concatenateStrings(element.outerHTML.replace('usable', 'unusable'),modifiedButtons))
      .join('');
      this.dataSharingService.setHtmlContent(filteredHtmlContent);

  }

  selectImage(advert: Advert, index: number): void {
    advert.selectedIndex = index;

  }

  concatenateStrings(originalString: string, appendString: string): string {
    if (originalString.length < 4) {
      // Handle cases where the original string is too short
      return originalString + appendString;
    }

    const prefix = originalString.slice(0, -6); // Get the first (length - 6) characters
    const suffix = originalString.slice(-6);    // Get the last 6 characters

    return prefix + appendString + suffix;
  }

  filterElementsByUsername(username: string, containerClass: string, usernameClass: string): HTMLCollectionOf<HTMLElement> {
    const elementsWithClass = this.el.nativeElement.querySelectorAll('.' + containerClass);
    // Convert NodeList to Array and explicitly type it
    const elementsArray: Element[] = Array.from(elementsWithClass);
    // Filter elements based on the username inside the <p> element
    const filteredElementsArray = elementsArray.filter((element: Element) => {
      const usernameElement = element.querySelector('.' + usernameClass);
      // Check if the username element exists and its text content is 'username1'
      return usernameElement && usernameElement.textContent === username;
    });
    console.log(filteredElementsArray);
    // Create a document fragment to hold the elements
    const fragment = document.createDocumentFragment();

    // Add filtered elements to the fragment
    filteredElementsArray.forEach((element) => {
      fragment.appendChild(element.cloneNode(true));
    });

    // Convert the fragment to HTMLCollection
    const filteredElementsCollection = fragment.children as HTMLCollectionOf<HTMLElement>;

    return filteredElementsCollection;
  }

  addToCart(advert: Advert) {
    this.loadCartData();
    // Adding a copy to the cart
    this.advertsInCart.push({ ...advert });
    localStorage.setItem(this.cartDataKey, JSON.stringify(this.advertsInCart));
  }

  private loadCartData() {
    const storedCartData = localStorage.getItem(this.cartDataKey);
    this.advertsInCart = storedCartData ? JSON.parse(storedCartData) : [];
  }

  openCartDialog(): void {
    const storedCartData = localStorage.getItem(this.cartDataKey);
    // Pass the data from localStorage to the dialog
    this.dialog.open(CartDialogComponent, {
      width: '55%',
      data: storedCartData ? JSON.parse(storedCartData) : []
    });
    this.updateAdverts();
  }

  updateAdverts(): void {
    this.advertService.triggerAdvertUpdate();
  }
}
