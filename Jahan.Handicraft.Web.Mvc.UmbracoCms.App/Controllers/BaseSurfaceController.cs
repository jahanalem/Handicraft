using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Umbraco.Core.Models;

namespace Jahan.Handicraft.Web.Mvc.UmbracoCms.App.Controllers
{
    public class BaseSurfaceController : Umbraco.Web.Mvc.SurfaceController
    {
        public IPublishedContent CurrentNode
        {
            get
            {
                if (UmbracoContext != null && UmbracoContext.PageId != null)
                    return Umbraco.TypedContent(UmbracoContext.PageId.GetValueOrDefault());
                return null;
            }
        }
    }
}