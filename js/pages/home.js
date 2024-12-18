import { renderComponent } from "../components/helpers.js";
import Carousel from '../components/ui/Carousel.mjs';

function Home() {

  const WidgetsContainer = document.createElement('div');
  WidgetsContainer.className = 'widgets-page';



  const imiges = [
    'https://i.pinimg.com/736x/f5/a6/92/f5a692d40734225d8712bf24cc1938e5.jpg',
    'https://i.pinimg.com/736x/ca/99/04/ca9904671537679701ba7cd582b4f9a8.jpg',
    'https://i.pinimg.com/736x/eb/d6/76/ebd6762d60db3f885832d3e48b688d73.jpg',
  ];

  const carousel = Carousel(imiges);
  WidgetsContainer.appendChild(carousel);

  // Render components to the DOM
  renderComponent(WidgetsContainer, 'content');
}

export { Home };