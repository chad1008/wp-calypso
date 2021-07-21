/**
 * External Dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */
import { localize } from 'i18n-calypso';
import {
	getPlanClass,
	isJetpackScan,
	isJetpackBackupSlug,
	isCompletePlan,
	isPremiumPlan,
	isSecurityDailyPlan,
	isSecurityRealTimePlan,
	isPersonalPlan,
	isBusinessPlan,
	isJetpackSearch,
	isJetpackAntiSpam,
	isJetpackPlanSlug,
} from '@automattic/calypso-products';
import { getSiteSlug, getSiteTitle, getSitePlanSlug } from 'calypso/state/sites/selectors';
import getRewindState from 'calypso/state/selectors/get-rewind-state';
import getSiteScanState from 'calypso/state/selectors/get-site-scan-state';
import JetpackBenefitsSiteVisits from 'calypso/blocks/jetpack-benefits/site-visits';
import JetpackBenefitsScanHistory from 'calypso/blocks/jetpack-benefits/scan-history';
import JetpackBenefitsSiteBackups from 'calypso/blocks/jetpack-benefits/site-backups';
import QueryJetpackScan from 'calypso/components/data/query-jetpack-scan';
import { getProductBySlug } from 'calypso/state/products-list/selectors';

/**
 * Style dependencies
 */
import './style.scss';

class JetpackBenefits extends React.Component {
	siteHasBackups() {
		return 'unavailable' !== this.props.rewindState?.state;
	}

	productHasBackups() {
		const { productSlug, planSlug } = this.props;
		// check that this product is standalone backups or a plan that contains backups
		return (
			isJetpackBackupSlug( productSlug ) ||
			isPersonalPlan( productSlug ) ||
			isPremiumPlan( productSlug ) ||
			( ! isPremiumPlan && !! planSlug && isBusinessPlan( planSlug ) ) || // Jetpack Professional
			isSecurityDailyPlan( productSlug ) ||
			isSecurityRealTimePlan( productSlug ) ||
			isCompletePlan( productSlug )
		);
	}

	siteHasScan() {
		return 'unavailable' !== this.props.scanState?.state;
	}

	productHasScan() {
		const { productSlug } = this.props;
		// check that this product is standalone scan or a plan that contains it
		return (
			isJetpackScan( productSlug ) ||
			isCompletePlan( productSlug ) ||
			isPremiumPlan( productSlug ) ||
			isSecurityDailyPlan( productSlug ) ||
			isSecurityRealTimePlan( productSlug )
		);
	}

	productHasSearch() {
		const { product, productSlug, planSlug } = this.props;
		// check that this product is a standalone search product or a plan that contains it
		return (
			isJetpackSearch( product ) ||
			isCompletePlan( productSlug ) ||
			( ! isPremiumPlan && !! planSlug && isBusinessPlan( planSlug ) ) // Jetpack Professional
		);
	}

	productHasAntiSpam() {
		const { productSlug, planSlug } = this.props;
		// check that this product is standalone anti-spam or one of the plans that contains it
		return (
			isJetpackAntiSpam( productSlug ) ||
			isPersonalPlan( productSlug ) ||
			isPremiumPlan( productSlug ) ||
			( ! isPremiumPlan && !! planSlug && isBusinessPlan( planSlug ) ) || // Jetpack Professional
			isSecurityDailyPlan( productSlug ) ||
			isSecurityRealTimePlan( productSlug ) ||
			isCompletePlan( productSlug )
		);
	}

	renderSiteSearch() {
		return (
			<div className="jetpack-benefits__card card">
				<div className="jetpack-benefits__card-summary">
					<b className="jetpack-benefits__card-headline">Search</b>
					<span>You will lose access to Jetpack's improved site search</span>
				</div>
			</div>
		);
	}

	renderSiteAnitSpam() {
		return (
			<div className="jetpack-benefits__card card">
				<div className="jetpack-benefits__card-summary">
					<b className="jetpack-benefits__card-headline">Anti-spam</b>
					<span>You will no longer have spam comment protection/ filtering.</span>
				</div>
			</div>
		);
	}

	renderSiteActivity() {
		return (
			<div className="jetpack-benefits__card card">
				<span>You will not be able to view your site's activity log any longer.</span>
			</div>
		);
	}

	/**
	 * Show benefits that do not depend on site data
	 * These can vary by plan, but we do not need to get any data about the site to show these
	 */
	renderGeneralBenefits() {
		// check the disconnection flow - some general Jetpack benefits are shown there now
	}

	render() {
		const { product, productSlug, siteId } = this.props;
		// determine what features a plan/ product has and show relevant messages

		return (
			<React.Fragment>
				{ this.productHasScan() && <QueryJetpackScan siteId={ siteId } /> }
				{
					isJetpackPlanSlug( productSlug ) && (
						<JetpackBenefitsSiteVisits siteId={ this.props.siteId } />
					) // only makes sense to show visits/ stats for plans
				}
				{ this.siteHasBackups() && this.productHasBackups() && (
					<JetpackBenefitsSiteBackups
						siteId={ siteId }
						isStandalone={ isJetpackBackupSlug( productSlug ) }
					/>
				) }
				{ this.productHasSearch() && this.renderSiteSearch() }
				{ this.productHasAntiSpam() && this.renderSiteAnitSpam() }
				{ this.siteHasScan() && this.productHasScan() && (
					<JetpackBenefitsScanHistory siteId={ siteId } isStandalone={ isJetpackScan( product ) } />
				) }
				{
					/* activity log stats - start with requestActivityLogs to get this information, there is also an endpoint for /activity/counts that has no matching state components that could get set up */
					isJetpackPlanSlug( productSlug ) && this.renderSiteActivity() // only makes sense to show activity for plans
				}
			</React.Fragment>
		);
	}
}

export default connect( ( state, { siteId, purchase } ) => {
	const planSlug = getSitePlanSlug( state, siteId );
	const planClass = planSlug ? getPlanClass( planSlug ) : 'is-free-plan';
	const productSlug = purchase.productSlug;
	const product = getProductBySlug( state, productSlug );

	return {
		siteId: siteId,
		planSlug: planSlug,
		plan: planClass,
		product: product,
		productSlug: productSlug,
		rewindState: getRewindState( state, siteId ),
		scanState: getSiteScanState( state, siteId ),
		siteSlug: getSiteSlug( state, siteId ),
		siteTitle: getSiteTitle( state, siteId ),
	};
}, {} )( localize( JetpackBenefits ) );
