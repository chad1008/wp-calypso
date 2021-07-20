/**
 * global wpcomLogmein
 */
/**
 * External dependencies
 */
import { select } from '@wordpress/data';

// Used as placeholder / default domain to detect when we're looking at a relative url,
// Note: also prevents exceptions from being raised
const INVALID_URL = `https://__domain__.invalid`;

type Host = string;

type LogmeinData = {
	IS_WPCOM: string;
};
declare let wpcomLogmein: LogmeinData;

export function logmeinUrl( url: string ): string {
	// Logmein currently only works for wpcom domains
	if ( wpcomLogmein?.IS_WPCOM !== 'IS_WPCOM' ) {
		return url;
	}

	const newurl = new URL( String( url ), INVALID_URL );

	// Ignore and passthrough invalid or /relative/urls that have no host or protocol specified
	if ( newurl.origin === INVALID_URL ) {
		return url;
	}

	// logmein doesn't work with http.
	if ( newurl.protocol !== 'https:' ) {
		return url;
	}

	// Only mapped domains need logmein, skip rewrite for wpcom subdomains
	if ( newurl.host.match( /https:\/\/[^.]*\.wordpress.com/ ) ) {
		return url;
	}

	const permalink = select( 'core/editor' ).getPermalink();
	const permaurl = new URL( String( permalink ), INVALID_URL );
	// Fallback on an invalid permalink
	if ( permaurl.origin === INVALID_URL ) {
		return url;
	}

	// Fallback if the url we're clicking on isn't pointing to our site that needs logging into
	if ( permaurl.host !== newurl.host ) {
		return url;
	}

	// Set the param
	newurl.searchParams.set( 'logmein', 'direct' );

	return newurl.toString();
}

export function attachLogmein(): void {
	document.addEventListener( 'click', logmeinOnLeftClick, true ); // left click only, need to capture for "View Post" snackbars which call preventDefault
	document.addEventListener( 'click', logmeinOnClick, false ); // left click (not), ctrl+click, focus+enter, touch click
	document.addEventListener( 'contextmenu', logmeinOnRightClick, false ); // right click
	document.addEventListener( 'auxclick', logmeinOnAuxClick, false ); // mouse middle
}

const seen: Record< Host, boolean > = {};
export function logmeinOnClick( event: MouseEvent ): void {
	// Left click handled by logmeinOnLeftClick capturing version
	if ( event.button === 0 ) {
		return;
	}

	const link = ( event.target as HTMLElement ).closest( 'a' );

	if ( link && link.href ) {
		// Only apply logmein to each host once to reduce excessive redirect flows, weak persistence is intended
		const host = new URL( String( link.href ), INVALID_URL ).host;
		if ( ! seen[ host ] ) {
			link.href = logmeinUrl( link.href );
			seen[ host ] = true;
		}
	}
}

export function logmeinOnRightClick( event: MouseEvent ): void {
	const link = ( event.target as HTMLElement ).closest( 'a' );

	// Always apply logmein on right click, we can't use the `seen` cache here because right clicks
	// won't always result in visiting the redirect url
	if ( link && link.href ) {
		link.href = logmeinUrl( link.href );
	}
}

export function logmeinOnAuxClick( event: MouseEvent ): void {
	// auxclick fires on right click but fires too late to apply the redirect to the new window/tab
	// for right click, rely on contextmenu events which fire early enough
	if ( event.button === 2 ) {
		return;
	}

	// Middle click (auxclick) events should follow the same behavior as left click
	logmeinOnClick( event );
}

export function logmeinOnLeftClick( event: MouseEvent ): void {
	if ( event.button !== 0 ) {
		return;
	}

	logmeinOnRightClick( event );
}

attachLogmein();
