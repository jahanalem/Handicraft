using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Umbraco.Core;
using Umbraco.Core.Services;
using Umbraco.Web;
using Umbraco.Web.PublishedCache;

namespace Jahan.Handicraft.Web.Mvc.UmbracoCms.App.AppCode
{
    public class Node
    {
        public static IContentService ContentService
        {
            get
            {
                return ApplicationContext.Current.Services.ContentService;
            }
        }

        public static ContextualPublishedContentCache ContentCache
        {
            get
            {
                return UmbracoContext.Current.ContentCache;
            }
        }
    }
}
