

var utils = require('cordova/utils'),
  common = require('./Common'),
  LatLng = require('./LatLng'),
  event = require('./event'),
  Overlay = require('./Overlay');

/*****************************************************************************
 * Marker Class
 *****************************************************************************/
var Marker = function(map, markerOptions, _exec, extras) {
  extras = extras || {};
  Overlay.call(this, map, markerOptions, extras.type || 'Marker', _exec, extras);

  var self = this;

  if (markerOptions && markerOptions.position) {
    markerOptions.position.lat = parseFloat(markerOptions.position.lat);
    markerOptions.position.lng = parseFloat(markerOptions.position.lng);
    self.set('position', markerOptions.position);
  }

  //-----------------------------------------------
  // Sets event listeners
  //-----------------------------------------------
  self.on(event.MARKER_CLICK, function() {
    self.showInfoWindow.apply(self);
  });

  self.on('position_changed', function() {
    var position = self.get('position');
    try {
      position.lat = parseFloat(position.lat, 10);
      position.lng = parseFloat(position.lng, 10);
      self.exec.call(self, null, self.errorHandler, 'PluginMarker', 'setPosition', [self.map.getId(), self.getId(), {
        'lat': position.lat,
        'lng': position.lng
      }]);
    } catch (e) {
      return;
    }
  });
  self.on('rotation_changed', function() {
    var rotation = self.get('rotation');
    self.exec.call(self, null, self.errorHandler, 'PluginMarker', 'setRotation', [self.map.getId(), self.getId(), rotation]);
  });
  self.on('snippet_changed', function() {
    var snippet = self.get('snippet');
    self.exec.call(self, null, self.errorHandler, 'PluginMarker', 'setSnippet', [self.map.getId(), self.getId(), snippet]);
  });
  self.on('visible_changed', function() {
    var visible = self.get('visible');
    self.exec.call(self, null, self.errorHandler, 'PluginMarker', 'setVisible', [self.map.getId(), self.getId(), visible]);
  });
  self.on('title_changed', function() {
    var title = self.get('title');
    self.exec.call(self, null, self.errorHandler, 'PluginMarker', 'setTitle', [self.map.getId(), self.getId(), title]);
  });
  self.on('icon_changed', function() {
    var icon = self.get('icon');

    var link;
    if (typeof icon === 'string') {
      if (icon.indexOf('://') === -1 &&
          icon.indexOf('.') === 0) {

        link = document.createElement('a');
        link.href = icon;
        icon = {
          'url': link.protocol+'//'+link.host+link.pathname + link.search
        };
        link = undefined;
      }
    } else if (typeof icon === 'object' && typeof icon.url === 'string') {
      if (icon.url.indexOf('://') === -1 &&
          icon.url.indexOf('.') === 0) {

        link = document.createElement('a');
        link.href = icon.url;
        icon.url = link.protocol+'//'+link.host+link.pathname + link.search;
        link = undefined;
      }
    }

    if (typeof icon === 'object' &&
        typeof icon.anchor === 'object' &&
        'x' in icon.anchor &&
        'y' in icon.anchor) {
      icon.anchor = [icon.anchor.x, icon.anchor.y];
    }

    self.exec.call(self, null, self.errorHandler, 'PluginMarker', 'setIcon', [self.map.getId(), self.getId(), icon]);
  });
  self.on('flat_changed', function() {
    var flat = self.get('flat');
    flat = flat === true;
    self.exec.call(self, null, self.errorHandler, 'PluginMarker', 'setFlat', [self.map.getId(), self.getId(), flat]);
  });
  self.on('draggable_changed', function() {
    var draggable = self.get('draggable');
    draggable = draggable === true;
    self.exec.call(self, null, self.errorHandler, 'PluginMarker', 'setDraggable', [self.map.getId(), self.getId(), draggable]);
  });
  self.on('anchor_changed', function() {
    var anchor = self.get('anchor');
    if (!anchor) {
      return;
    }
    self.exec.call(self, null, self.errorHandler, 'PluginMarker', 'setIconAnchor', [self.map.getId(), self.getId(), anchor[0], anchor[1]]);
  });
  self.on('infoWindowAnchor_changed', function() {
    var anchor = self.get('infoWindowAnchor');
    if (!anchor) {
      return;
    }
    self.exec.call(self, null, self.errorHandler, 'PluginMarker', 'setInfoWindowAnchor', [self.map.getId(), self.getId(), anchor[0], anchor[1]]);
  });
  self.on('zIndex_changed', function() {
    var zIndex = self.get('zIndex');
    if (zIndex === null || zIndex === undefined) {
      return;
    }
    self.exec.call(self, null, self.errorHandler, 'PluginMarker', 'setZIndex', [self.map.getId(), self.getId(), zIndex]);
  });
  self.on('opacity_changed', function() {
    var opacity = self.get('opacity');
    self.exec.call(self, null, self.errorHandler, 'PluginMarker', 'setOpacity', [self.map.getId(), self.getId(), opacity]);
  });
  self.on('disableAutoPan_changed', function() {
    var disableAutoPan = self.get('disableAutoPan');
    self.exec.call(self, null, self.errorHandler, 'PluginMarker', 'setDisableAutoPan', [self.map.getId(), self.getId(), disableAutoPan]);
  });

};

utils.extend(Marker, Overlay);

Marker.prototype.remove = function(callback) {
  var self = this;
  if (self._isRemoved) {
    if (typeof callback === 'function') {
      return;
    } else {
      return Promise.resolve();
    }
  }
  Object.defineProperty(self, '_isRemoved', {
    value: true,
    writable: false
  });
  self.trigger(event.INFO_CLOSE); // close open infowindow, otherwise it will stay
  self.trigger(self.__pgmId + '_remove');

  var resolver = function(resolve, reject) {
    self.exec.call(self,
      function() {
        self.destroy();
        resolve.call(self);
      },
      reject.bind(self),
      'PluginMarker', 'remove', [self.map.getId(), self.getId()], {
        remove: true
      });
  };

  if (typeof callback === 'function') {
    resolver(callback, self.errorHandler);
  } else {
    return new Promise(resolver);
  }


};

Marker.prototype.getOptions = function() {
  var self = this;
  return {
    '__pgmId': self.getId(),
    'position': self.getPosition(),
    'disableAutoPan': self.get('disableAutoPan'),
    'opacity': self.get('opacity'),
    'icon': self.get('icon'),
    'zIndex': self.get('zIndex'),
    'anchor': self.get('anchor'),
    'infoWindowAnchor': self.get('infoWindowAnchor'),
    'draggable': self.get('draggable'),
    'title': self.getTitle(),
    'snippet': self.getSnippet(),
    'visible': self.get('visible'),
    'rotation': self.getRotation()
  };
};
Marker.prototype.getPosition = function() {
  var position = this.get('position');
  if (!(position instanceof LatLng)) {
    return new LatLng(position.lat, position.lng);
  }
  return position;
};

Marker.prototype.setAnimation = function(animation, callback) {
  var self = this;

  animation = animation || null;
  if (!animation) {
    // just ignore
    if (typeof callback === 'function') {
      return self;
    } else {
      return Promise.resolve();
    }
  }
  self.set('animation', animation);

  var resolver = function(resolve, reject) {
    self.exec.call(self,
      resolve.bind(self),
      reject.bind(self),
      'PluginMarker', 'setAnimation', [self.map.getId(), self.getId(), animation]);
  };

  if (typeof callback === 'function') {
    resolver(callback, self.errorHandler);
    return self;
  } else {
    return new Promise(resolver);
  }

};

Marker.prototype.setDisableAutoPan = function(disableAutoPan) {
  disableAutoPan = common.parseBoolean(disableAutoPan);
  this.set('disableAutoPan', disableAutoPan);
  return this;
};
Marker.prototype.setOpacity = function(opacity) {
  if (!opacity && opacity !== 0) {
    console.log('opacity value must be int or double');
    return false;
  }
  this.set('opacity', opacity);
  return this;
};
Marker.prototype.setZIndex = function(zIndex) {
  if (typeof zIndex === 'undefined') {
    return false;
  }
  this.set('zIndex', zIndex);
  return this;
};
Marker.prototype.getOpacity = function() {
  return this.get('opacity');
};
Marker.prototype.setIconAnchor = function(anchorX, anchorY) {
  this.set('anchor', [anchorX, anchorY]);
  return this;
};
Marker.prototype.setInfoWindowAnchor = function(anchorX, anchorY) {
  this.set('infoWindowAnchor', [anchorX, anchorY]);
  return this;
};
Marker.prototype.setDraggable = function(draggable) {
  draggable = common.parseBoolean(draggable);
  this.set('draggable', draggable);
  return this;
};
Marker.prototype.isDraggable = function() {
  return this.get('draggable');
};
Marker.prototype.setFlat = function(flat) {
  flat = common.parseBoolean(flat);
  this.set('flat', flat);
  return this;
};
Marker.prototype.setIcon = function(url) {
  if (url && common.isHTMLColorString(url)) {
    url = common.HTMLColor2RGBA(url);
  }
  this.set('icon', url);
  return this;
};
Marker.prototype.setTitle = function(title) {
  if (!title) {
    console.log('missing value for title');
    return this;
  }
  title = '' + title; // Convert to strings mandatory
  this.set('title', title);
  return this;
};
Marker.prototype.setVisible = function(visible) {
  visible = common.parseBoolean(visible);
  this.set('visible', visible);
  if (!visible && this.map.get('active_marker_id') === this.__pgmId) {
    this.map.set('active_marker_id', undefined);
  }
  return this;
};
Marker.prototype.getTitle = function() {
  return this.get('title');
};
Marker.prototype.setSnippet = function(snippet) {
  this.set('snippet', snippet);
  return this;
};
Marker.prototype.getSnippet = function() {
  return this.get('snippet');
};
Marker.prototype.setRotation = function(rotation) {
  if (typeof rotation !== 'number') {
    console.log('missing value for rotation');
    return false;
  }
  this.set('rotation', rotation);
  return this;
};
Marker.prototype.getRotation = function() {
  return this.get('rotation');
};
Marker.prototype.showInfoWindow = function() {
  var self = this;
  //if (!self.get('title') && !self.get('snippet') ||
  //    self.get('isInfoWindowVisible')) {
  if (!self.get('title') && !self.get('snippet')) {
    return;
  }
  self.set('isInfoWindowVisible', true);
  self.map.set('active_marker_id', self.__pgmId);
  self.exec.call(self, null, self.errorHandler, 'PluginMarker', 'showInfoWindow', [self.map.getId(), self.getId()], {
    sync: true
  });
  return self;
};
Marker.prototype.hideInfoWindow = function() {
  var self = this;
  if (self.map.get('active_marker_id') === self.__pgmId) {
    self.map.set('active_marker_id', null);
  }
  if (self.get('isInfoWindowVisible')) {
    self.set('isInfoWindowVisible', false);
    self.exec.call(self, null, self.errorHandler, 'PluginMarker', 'hideInfoWindow', [self.map.getId(), self.getId()], {
      sync: true
    });
  }
  return self;
};
Marker.prototype.isInfoWindowShown = function() {
  return this.get('isInfoWindowVisible') === true;
};
Marker.prototype.isVisible = function() {
  return this.get('visible') === true;
};

Marker.prototype.setPosition = function(position) {
  if (!position) {
    console.log('missing value for position');
    return false;
  }
  this.set('position', {
    'lat': position.lat,
    'lng': position.lng
  });
  return this;
};

module.exports = Marker;
