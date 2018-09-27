import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './header.css';
import Nav from './nav';

export default class Header extends Component {
  render() {
    return (
      <header className="header">
        <div className="header_content">
          <h1 className="header_title">
            <Link to="/" className="header_titleLink">
              <img src="/logo.png" alt="FI Calc Logo" className="header_logo" />
              FI Calc
            </Link>
          </h1>
          <Nav />
        </div>
      </header>
    );
  }
}