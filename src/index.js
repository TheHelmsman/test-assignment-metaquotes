// Test import of a JavaScript function, an SVG, and Sass
import './styles/index.scss'

import { Controller } from "./controller"
import { Model } from "./model"
import { View } from "./view"

const app = new Controller(new Model(), new View())