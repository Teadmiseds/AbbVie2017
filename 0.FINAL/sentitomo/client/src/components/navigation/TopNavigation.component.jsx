import React, { Component } from "react";
import PropTypes from 'prop-types';
import { NavLink } from "react-router-dom";
import { Container, Menu, Image } from "semantic-ui-react";
import Icon from '../Icon.component';
import { withRouter } from 'react-router-dom';


/**
 * @class SideNavigation
 * @extends {React.Component}
 * @description Class for displaying the top navigation of the app if viewed on mobile
 */
class TopNavigation extends Component {

    render() {
        const { match, ...props } = this.props;

        return (
            <Menu className="navbar-top mobile only" fixed="top">
                <Container fluid>
                    <Menu.Item header ><NavLink to={'/app'}>Sentitomo</NavLink></Menu.Item>
                    <NavLink to={match.url + '/dashboard'} activeClassName="active">
                        <Menu.Item
                            active={false}
                            link
                            name="dashboard" >
                            <Icon name='home' large />
                            Dashboard
                        </Menu.Item>
                    </NavLink>
                    <NavLink to={match.url + '/toolbox'} activeClassName="active">
                        <Menu.Item
                            active={false}
                            link
                            name="toolbox" >
                            <Icon name='settings' large />
                            Toolbox
                        </Menu.Item>
                    </NavLink>
                </Container>
            </Menu >
        );
    }
}

TopNavigation.propTypes = {
    /** {Object} The match object from react-router */
    match: PropTypes.object
}

export default withRouter(TopNavigation);