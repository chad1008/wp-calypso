/**
 * External Dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */
import { localize } from 'i18n-calypso';

class JetpackBenefitsSiteBackups extends React.Component {
	render() {
		// if this is a standalone backup solution, show some more detailed information about the last backup taken
		const { isStandalone } = this.props;

		if ( isStandalone ) {
			return (
				<div className="jetpack-benefits__card card">
					<span>Standalone backups</span>
				</div>
			);
		}

		return (
			<div className="jetpack-benefits__card card">
				<span>Information about backups</span>
			</div>
		);
	}
}

export default connect( () => {
	return {};
}, {} )( localize( JetpackBenefitsSiteBackups ) );
